/**
 * 错误处理中间件
 */
const errorHandler = (error, req, res, next) => {
	console.error("未处理的错误:", error);

	// MongoDB 重复键错误
	if (error.code === 11000) {
		const fieldName = Object.keys(error.keyPattern)[0];
		return res.status(422).send({
			message: `${fieldName} 已存在`,
			error: "DUPLICATE_KEY",
		});
	}

	// Mongoose 验证错误
	if (error.name === "ValidationError") {
		const errors = Object.values(error.errors).map((err) => ({
			field: err.path,
			message: err.message,
		}));
		return res.status(422).send({
			message: "数据验证失败",
			errors: errors,
			error: "VALIDATION_ERROR",
		});
	}

	// 其他错误
	res.status(500).send({
		message: "服务器内部错误",
		error: "INTERNAL_ERROR",
	});
};

module.exports = errorHandler;