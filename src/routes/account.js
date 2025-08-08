// routes/account.js

const express = require("express");
const errorJson = require("../utils/errors").json;
const errorCode = require("../utils/errors").code;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { UserDatabase, ServerDatabase, BanDatabase } = require("../models");
const auth = require("../middleware/auth");
const banCheck = require("../middleware/ban");
const { validateUserName, validatePassword } = require("../utils/validators");
require("dotenv").config();

const router = express.Router();

// JWT 密钥
const SECRET = process.env.JWT_SECRET || process.env.SECRET;
const DB_SERVER_NAME = process.env.DB_SERVER_NAME || "account_server";

const LOGIN_LIMITER_MAX = parseInt(process.env.LOGIN_LIMITER_MAX || "10", 10);
const LOGIN_LIMITER_TIME = parseInt(process.env.LOGIN_LIMITER_WINDOW || "15", 10) * 60 * 1000;

// 管理员白名单（user_id，逗号分隔）
const ADMIN_WHITELIST = (process.env.ADMIN_WHITELIST || "").split(",").map(s => s.trim()).filter(Boolean);

// 登录限流：LOGIN_LIMITER_TIME 分钟内最多 LOGIN_LIMITER_MAX 次
const loginLimiter = rateLimit({
	windowMs: LOGIN_LIMITER_TIME * 60 * 1000,
	max: LOGIN_LIMITER_MAX,
	message: {
		error: "TOO_MANY_REQUESTS",
		message: "请求过于频繁，请稍后再试。",
	},
});

// 获取全局用户ID 并原子递增
async function getNextGlobalUid() {
	const result = await ServerDatabase.findOneAndUpdate(
		{ server_name: DB_SERVER_NAME },
		{ $inc: { server_global_user_counter: 1 } },
		{ new: true, upsert: true }
	);
	return result.server_global_user_counter;
}

/**
 * 注册新用户
 */
router.post("/register", async (req, res, next) => {
	try {
		const { user_name, user_password } = req.body;
		if (!user_name || !user_password) {
			return res.status(422).json(errorJson.MISSING_FIELDS);
		}

		const userNameError = validateUserName(user_name);
		if (userNameError) {
			return res
				.status(422)
				.json(errorJson.INVALID_USERNAME);
		}

		const passwordError = validatePassword(user_password);
		if (passwordError) {
			return res
				.status(422)
				.json(errorJson.INVALID_PASSWORD);
		}

		const user_id = await getNextGlobalUid();
		const hashedPassword = await bcrypt.hash(user_password, 10);
		const user = await UserDatabase.create({
			user_name,
			user_password: hashedPassword,
			user_id,
		});

		res.status(201).json({
			message: "用户注册成功",
      		error: errorCode.NORMAL.code,
			user: { user_name: user.user_name, user_id: user.user_id },
		});
	} catch (err) {
		if (err.code === 11000 && err.keyPattern?.user_name) {
			return res
				.status(422)
				.json(errorJson.USERNAME_EXISTS);
		}
		next(err);
	}
});

/**
 * 用户登录
 */
router.post("/login", loginLimiter, async (req, res, next) => {
	try {
		const { user_name, user_password } = req.body;
		if (!user_name || !user_password) {
			return res
				.status(422)
				.json(errorJson.MISSING_FIELDS);
		}

		const userNameError = validateUserName(user_name);
		if (userNameError) {
			return res
				.status(422)
				.json(errorJson.INVALID_USERNAME);
		}
		const passwordError = validatePassword(user_password);
		if (passwordError) {
			return res
				.status(422)
				.json(errorJson.INVALID_PASSWORD);
		}

		const user = await UserDatabase.findOne({ user_name });
		if (!user) {
			return res
				.status(404)
				.json(errorJson.USER_NOT_FOUND);
		}

		const match = await bcrypt.compare(user_password, user.user_password);
		if (!match) {
			return res
				.status(401)
				.json(errorJson.INVALID_CREDENTIALS);
		}

		const isBanned = await BanDatabase.exists({ user_id: user.user_id });
		if (isBanned) {
			return res
				.status(403)
				.json(errorJson.USER_BANNED);
		}

		const payload = { user_id: user.user_id, user_name: user.user_name };
		const token = jwt.sign(payload, SECRET, { expiresIn: "7d" });
		res.json({ token, user: payload });
	} catch (err) {
		next(err);
	}
});

/**
 * 获取当前用户信息
 */
router.get("/auth", auth, banCheck, (req, res) => {
	res.json({ user: req.user });
});

/**
 * 封禁用户
 */
router.post("/ban", auth, async (req, res, next) => {
	try {
		const { user_id, ban_reason, ban_time, unban_time } = req.body;
		if (!user_id || !ban_reason || !ban_time || !unban_time) {
			return res
				.status(422)
				.json(errorJson.MISSING_FIELDS);
		}

		// 操作人是否在管理员白名单
		const operatorId = req.user?.user_id;
		if (!ADMIN_WHITELIST.includes(String(operatorId))) {
			return res.status(403).json(errorJson.NO_BAN_PERMISSION);
		}

		const user = await UserDatabase.findOne({ user_id });
		if (!user) {
			return res
				.status(404)
				.json(errorJson.USER_NOT_FOUND);
		}

		await BanDatabase.create({
			user_id,
			ban_reason,
			ban_time: new Date(ban_time),
			unban_time: new Date(unban_time),
		});
		res.status(201).json({ message: "用户已封禁" });
	} catch (err) {
		next(err);
	}
});

/**
 * 解封用户
 */
router.delete("/ban/:user_id", auth, async (req, res, next) => {
	try {
		const uid = parseInt(req.params.user_id, 10);
		const result = await BanDatabase.deleteMany({ user_id: uid });
		if (result.deletedCount === 0) {
			return res
				.status(404)
				.json(errorJson.BAN_NOT_FOUND);
		}
		res.json({ message: "用户已解封" });
	} catch (err) {
		next(err);
	}
});

module.exports = router;
