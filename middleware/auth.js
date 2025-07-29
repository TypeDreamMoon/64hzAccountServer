const jwt = require("jsonwebtoken");
const { UserDatabase } = require("../models");

const SECRET = process.env.SECRET;

/**
 * 认证中间件
 */
const auth = async (req, res, next) => {
	try {
		// 检查 Authorization 头是否存在
		if (!req.headers.authorization) {
			return res.status(401).send({
				message: "未提供认证信息",
				error: "MISSING_AUTHORIZATION",
			});
		}

		// 解析 token
		const authHeader = req.headers.authorization;
		const parts = authHeader.split(" ");

		// 检查 Bearer token 格式
		if (parts.length !== 2 || parts[0] !== "Bearer") {
			return res.status(401).send({
				message: "认证格式错误",
				error: "INVALID_AUTHORIZATION_FORMAT",
			});
		}

		const token = parts[1];

		// 验证 token
		let decoded;
		try {
			decoded = jwt.verify(token, SECRET);
		} catch (error) {
			if (error.name === "TokenExpiredError") {
				return res.status(401).send({
					message: "认证已过期",
					error: "TOKEN_EXPIRED",
				});
			}
			if (error.name === "JsonWebTokenError") {
				return res.status(401).send({
					message: "无效的认证令牌",
					error: "INVALID_TOKEN",
				});
			}
			throw error; // 其他错误继续抛出
		}

		// 检查解码后的数据
		if (!decoded || !decoded.id) {
			return res.status(401).send({
				message: "无效的认证信息",
				error: "INVALID_AUTHENTICATION_DATA",
			});
		}

		// 查找用户
		const user = await UserDatabase.findById(decoded.id);
		if (!user) {
			return res.status(401).send({
				message: "用户不存在",
				error: "USER_NOT_FOUND",
			});
		}

		// 将用户信息附加到请求对象
		req.user = user;
		next();
	} catch (error) {
		console.error("认证过程中发生错误:", error);
		return res.status(500).send({
			message: "认证过程中发生错误",
			error: "AUTHENTICATION_ERROR",
		});
	}
};

module.exports = auth;