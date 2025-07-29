const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { UserDatabase, ServerDatabase } = require("../models");
const { validateUserName, validatePassword } = require("../utils/validators");
const auth = require("../middleware/auth");

const router = express.Router();

const SECRET = process.env.SECRET;
const LOGIN_LIMITER_MAX = process.env.LOGIN_LIMITER_MAX || 10;
const LOGIN_LIMITER_TIME = process.env.LOGIN_LIMITER_TIME || 10; // minutes

// 登录接口限流
const loginLimiter = rateLimit({
	windowMs: LOGIN_LIMITER_TIME * 60 * 1000,
	max: LOGIN_LIMITER_MAX,
	message: "登录尝试次数过多，请稍后再试",
	error: "LOGIN_ATTEMPTS_TOO_MANY",
});

/**
 * 获取下一个全局用户ID并递增计数器
 */
const get_next_global_uid = async () => {
	const result = await ServerDatabase.findOneAndUpdate(
		{ server_name: "account" },
		{ $inc: { server_global_user_counter: 1 } },
		{ new: true }
	);

	if (!result) {
		throw new Error("无法获取新的用户ID");
	}

	return result.server_global_user_counter;
};

/**
 * @api {get} /api/account/users Get all users
 */
router.get("/users", async (req, res) => {
	const users = await UserDatabase.find();
	res.send(users);
});

/**
 * @api {post} /api/account/register Register a new user
 */
router.post("/register", async (req, res) => {
	try {
		// 检查请求参数是否存在
		if (!req.body.user_name || !req.body.user_password) {
			return res.status(422).send({
				message: "用户名和密码不能为空",
				error: "MISSING_FIELDS",
			});
		}

		// 验证用户名有效性
		const userNameError = validateUserName(req.body.user_name);
		if (userNameError) {
			return res.status(422).send({
				message: userNameError,
				error: "INVALID_USERNAME",
			});
		}

		// 验证密码有效性
		const passwordError = validatePassword(req.body.user_password);
		if (passwordError) {
			return res.status(422).send({
				message: passwordError,
				error: "INVALID_PASSWORD",
			});
		}

		// 获取用户ID
		const userId = await get_next_global_uid();
		
		// 密码加密
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(req.body.user_password, saltRounds);

		// 创建用户时包含所有必需字段
		const user = await UserDatabase.create({
			user_name: req.body.user_name,
			user_password: hashedPassword,
			user_id: userId,  // 提供必需的 user_id 字段
		});

		res.status(201).send({
			message: "用户注册成功",
			user: {
				id: user._id,
				user_name: user.user_name,
				user_id: user.user_id,
			},
		});
	} catch (error) {
		// 处理重复用户名错误
		if (error.code === 11000 && error.keyPattern?.user_name) {
			return res.status(422).send({
				message: "用户名已存在，请选择其他用户名",
				error: "USERNAME_EXISTS",
			});
		}

		// 处理其他验证错误
		if (error.name === "ValidationError") {
			const errors = Object.values(error.errors).map(
				(err) => err.message
			);
			return res.status(422).send({
				message: "输入信息验证失败",
				errors: errors,
				error: "VALIDATION_ERROR",
			});
		}

		// 记录未知错误并返回通用错误信息
		console.error("注册失败:", error);
		return res.status(500).send({
			message: "注册过程中发生未知错误，请稍后重试",
			error: "REGISTRATION_FAILED",
		});
	}
});

/**
 * @api {post} /api/account/login Login a user
 */
router.post("/login", loginLimiter, async (req, res) => {
	// 检查请求参数
	if (!req.body.user_name || !req.body.user_password) {
		return res.status(422).send({
			message: "用户名和密码不能为空",
			error: "MISSING_FIELDS",
		});
	}

	const user = await UserDatabase.findOne({
		user_name: req.body.user_name,
	});

	if (!user) {
		return res.status(422).send({
			message: "用户不存在",
			error: "USER_NOT_FOUND",
		});
	}

	// 检查用户是否有密码字段
	if (!user.user_password) {
		console.error("用户文档缺少密码字段:", user._id);
		return res.status(500).send({
			message: "用户数据异常，请联系管理员",
			error: "USER_DATA_ERROR",
		});
	}

	try {
		// 使用异步密码比较
		const isPasswordValid = await bcrypt.compare(
			req.body.user_password,
			user.user_password
		);

		if (!isPasswordValid) {
			return res.status(422).send({
				message: "密码错误",
				error: "INVALID_PASSWORD",
			});
		}

		const token = jwt.sign(
			{
				id: String(user._id),
			},
			SECRET
		);

		res.send({
			message: "登录成功",
			user: {
				id: user._id,
				user_name: user.user_name,
				user_id: user.user_id,
			},
			token: token,
		});
	} catch (error) {
		console.error("密码验证失败:", error);
		return res.status(500).send({
			message: "验证过程中发生错误",
			error: "AUTHENTICATION_ERROR",
		});
	}
});

/**
 * @api {get} /api/account/auth 获取用户认证信息
 */
router.get("/auth", auth, async (req, res) => {
	try {
		// 检查用户对象是否存在
		if (!req.user) {
			return res.status(401).send({
				message: "用户未认证",
				error: "USER_NOT_AUTHENTICATED",
			});
		}

		// 检查必要字段是否存在
		if (!req.user.user_name || req.user.user_id === undefined) {
			return res.status(500).send({
				message: "用户数据不完整",
				error: "INCOMPLETE_USER_DATA",
			});
		}

		// 正常返回用户信息
		res.send({
			user_name: req.user.user_name,
			user_id: req.user.user_id,
		});
	} catch (error) {
		console.error("获取认证信息失败:", error);

		// 处理特定的Mongoose错误
		if (error.name === "CastError") {
			return res.status(500).send({
				message: "数据格式错误",
				error: "DATA_FORMAT_ERROR",
			});
		}

		// 处理其他未预期的错误
		return res.status(500).send({
			message: "获取认证信息时发生未知错误",
			error: "AUTH_INFO_ERROR",
		});
	}
});

module.exports = router;