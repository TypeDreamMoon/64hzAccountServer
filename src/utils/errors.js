module.exports = {
	code: {
		MISSING_FIELDS: {
			code: "MISSING_FIELDS",
			message: "缺少必填字段。",
		},
		INVALID_USERNAME: {
			code: "INVALID_USERNAME",
			message: "用户名格式不正确。",
		},
		INVALID_PASSWORD: {
			code: "INVALID_PASSWORD",
			message: "密码格式不正确。",
		},
		USERNAME_EXISTS: {
			code: "USERNAME_EXISTS",
			message: "用户名已存在。",
		},
		TOO_MANY_REQUESTS: {
			code: "TOO_MANY_REQUESTS",
			message: "请求过于频繁，请稍后再试。",
		},
		USER_NOT_FOUND: {
			code: "USER_NOT_FOUND",
			message: "用户不存在。",
		},
		INVALID_CREDENTIALS: {
			code: "INVALID_CREDENTIALS",
			message: "用户名或密码错误。",
		},
		USER_BANNED: {
			code: "USER_BANNED",
			message: "您的账号已被封禁。",
		},
		BAN_NOT_FOUND: {
			code: "BAN_NOT_FOUND",
			message: "未找到封禁记录。",
		},
		USER_NOT_AUTHENTICATED: {
			code: "USER_NOT_AUTHENTICATED",
			message: "未提供认证 Token。",
		},
		INVALID_AUTH_HEADER: {
			code: "INVALID_AUTH_HEADER",
			message: "错误的认证头格式，应为 Bearer <token>。",
		},
		INVALID_TOKEN: {
			code: "INVALID_TOKEN",
			message: "无效或已过期的 Token。",
		},
		INTERNAL_ERROR: {
			code: "INTERNAL_ERROR",
			message: "服务器内部错误，请稍后重试。",
		},
		VALIDATION_ERROR: {
			code: "VALIDATION_ERROR",
			message: "数据验证失败",
		},
		NO_BAN_PERMISSION: {
			code: "NO_BAN_PERMISSION",
			message: "无封禁权限，非管理员白名单用户。",
		},
		NORMAL: {
			code: "NORMAL",
			message: "正常",
		},
	},
	json: {
		MISSING_FIELDS: {
			error: "MISSING_FIELDS",
			message: "缺少必填字段。",
		},
		INVALID_USERNAME: {
			error: "INVALID_USERNAME",
			message: "用户名格式不正确。",
		},
		INVALID_PASSWORD: {
			error: "INVALID_PASSWORD",
			message: "密码格式不正确。",
		},
		USERNAME_EXISTS: {
			error: "USERNAME_EXISTS",
			message: "用户名已存在。",
		},
		TOO_MANY_REQUESTS: {
			error: "TOO_MANY_REQUESTS",
			message: "请求过于频繁，请稍后再试。",
		},
		USER_NOT_FOUND: {
			error: "USER_NOT_FOUND",
			message: "用户不存在。",
		},
		INVALID_CREDENTIALS: {
			error: "INVALID_CREDENTIALS",
			message: "用户名或密码错误。",
		},
		USER_BANNED: {
			error: "USER_BANNED",
			message: "您的账号已被封禁。",
		},
		BAN_NOT_FOUND: {
			error: "BAN_NOT_FOUND",
			message: "未找到封禁记录。",
		},
		USER_NOT_AUTHENTICATED: {
			error: "USER_NOT_AUTHENTICATED",
			message: "未提供认证 Token。",
		},
		INVALID_AUTH_HEADER: {
			error: "INVALID_AUTH_HEADER",
			message: "错误的认证头格式，应为 Bearer <token>。",
		},
		INVALID_TOKEN: {
			error: "INVALID_TOKEN",
			message: "无效或已过期的 Token。",
		},
		INTERNAL_ERROR: {
			error: "INTERNAL_ERROR",
			message: "服务器内部错误，请稍后重试。",
		},
		VALIDATION_ERROR: {
			error: "VALIDATION_ERROR",
			message: "数据验证失败",
		},
		NO_PERMISSION: {
			error: "NO_PERMISSION",
			message: "无权限，非管理员。",
		},
		NORMAL: {
			error: "NORMAL",
			message: "正常",
		},
	},
};
