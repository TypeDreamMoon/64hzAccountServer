/**
 * 验证用户名格式
 */
const validateUserName = (userName) => {
	if (!userName) {
		return "用户名不能为空";
	}

	if (userName.length < 3 || userName.length > 20) {
		return "用户名长度必须在3-20个字符之间";
	}

	if (!/^[a-zA-Z0-9_]+$/.test(userName)) {
		return "用户名只能包含字母、数字和下划线";
	}

	return null;
};

/**
 * 验证密码格式
 */
const validatePassword = (password) => {
	if (!password) {
		return "密码不能为空";
	}

	if (password.length < 6 || password.length > 32) {
		return "密码长度必须在6-32个字符之间";
	}

	if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) {
		return "密码包含无效字符";
	}

	return null;
};

module.exports = {
  validateUserName,
  validatePassword
};