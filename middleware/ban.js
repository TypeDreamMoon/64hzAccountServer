const { BanDatabase } = require("../models");

/**

封禁检查中间件

如果 Ban 集合中存在对应 user_id，则视为被封禁，阻止访问
*/
module.exports = async (req, res, next) => {
	try {
		// 假设 auth 中间件已将 user 信息附加到 req.user
		const userId = req.user && req.user.user_id;
		if (!userId) {
			// 未登录或缺少 user_id，直接放行至后续的 auth 逻辑处理
			return next();
		}

		const isBanned = await BanDatabase.exists({ user_id: userId });
		if (isBanned) {
			return res.status(403).json({
				error: "USER_BANNED",
				message: "您的账号已被封禁，如有疑问请联系管理员。",
			});
		}

		next();
	} catch (err) {
		next(err);
	}
};
