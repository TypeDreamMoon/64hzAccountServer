// middleware/adminAuth.js
require("dotenv").config();
const errorJson = require("../utils/errors").json;
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const ServerDatabase = require("../models/server");

module.exports = async (req, res, next) => {
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
        // 3. 查询服务器配置，判断 user_id 是否在 admin_ids
        const server = await ServerDatabase.findOne({});
        if (!server || !Array.isArray(server.server_global_admin_ids) || !server.server_global_admin_ids.includes(Number(payload.user_id))) {
            return res.status(403).json(errorJson.NO_PERMISSION);
        }
        // 4. 挂载用户信息
        req.user = {
            user_id: payload.user_id,
            user_name: payload.user_name,
        };
        next();
    } catch (err) {
        return res.status(401).json(errorJson.INVALID_TOKEN);
    }
};
