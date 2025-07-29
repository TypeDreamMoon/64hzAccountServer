const { ServerDatabase } = require("../models");

/**
 * 获取当前全局用户ID计数器
 */
const global_uid = async () => {
	const server = await ServerDatabase.findOne({ server_name: "account" });
	if (!server) {
		throw new Error("服务器配置未找到");
	}
	return server.server_global_user_counter;
};

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

module.exports = {
  global_uid,
  get_next_global_uid
};