// middleware/auth.js

require("dotenv").config();
const errorJson = require("../utils/errors").json;
const errorCode = require("../utils/errors").code;
const jwt = require("jsonwebtoken");
// 和 login 时用的一致
const SECRET = process.env.SECRET;

module.exports = (req, res, next) => {
	// 1. 拿到 Authorization: Bearer <token>
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json(errorJson.USER_NOT_AUTHENTICATED);
	}

	const parts = authHeader.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return res.status(401).json(errorJson.INVALID_AUTH_HEADER);
	}

	const token = parts[1];
	try {
		// 2. 验证 token
		const payload = jwt.verify(token, SECRET);
		// 3. 将用户信息挂到 req.user
		req.user = {
			user_id: payload.user_id,
			user_name: payload.user_name,
		};
		next();
	} catch (err) {
		return res.status(401).json(errorJson.INVALID_TOKEN);
	}
};
