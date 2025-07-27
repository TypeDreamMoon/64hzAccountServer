const { UserDatabase, ServerDatabase } = require("./models");
const jwt = require("jsonwebtoken");
const express = require("express");

const SECRET = process.env.SECRET;
const LISTEN_PORT = process.env.LISTEN_PORT || 3000;
const LISTEN_HOST = process.env.LISTEN_HOST || '0.0.0.0';

const app = express();
app.use(express.json());

/*  DB Struct ==============================
	user_name: String,
	user_password: String,
	user_id: int64,
	user_login_disable: bool,
	user_login_disable_reason: String,
    ======================================== */

/* Server Struct ==========================
	server_name: String,
	server_global_id: number,
	server_global_user_counter: number,
    ======================================== */

/**
 * 错误处理中间件
 */
app.use((error, req, res, next) => {
    console.error("未处理的错误:", error);
    
    // MongoDB 重复键错误
    if (error.code === 11000) {
        const fieldName = Object.keys(error.keyPattern)[0];
        return res.status(422).send({
            message: `${fieldName} 已存在`,
            error: "DUPLICATE_KEY"
        });
    }
    
    // Mongoose 验证错误
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
        }));
        return res.status(422).send({
            message: "数据验证失败",
            errors: errors
        });
    }
    
    // 其他错误
    res.status(500).send({
        message: "服务器内部错误",
        error: "INTERNAL_ERROR"
    });
});

/**
 * @api {get} / Welcome
 */
app.get("/", async (req, res) => {
	res.send("Welcome to 64hz Account server!");
});

/**
 * @api {get} /api/users Get all users
 */
app.get("/api/users", async (req, res) => {
	const users = await UserDatabase.find();
	res.send(users);
});

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

/**
 * @api {post} /api/register Register a new user
 */
app.post("/api/register", async (req, res) => {
    try {
        // 检查请求参数是否存在
        if (!req.body.user_name || !req.body.user_password) {
            return res.status(422).send({
                message: "用户名和密码不能为空"
            });
        }

        // 验证用户名有效性
        const userNameError = validateUserName(req.body.user_name);
        if (userNameError) {
            return res.status(422).send({
                message: userNameError
            });
        }

        // 验证密码有效性
        const passwordError = validatePassword(req.body.user_password);
        if (passwordError) {
            return res.status(422).send({
                message: passwordError
            });
        }

        const user = await UserDatabase.create({
            user_name: req.body.user_name,
            user_password: req.body.user_password,
            user_login_disable: false,
            user_login_disable_reason: "normal login",
        });

        // 用户创建成功后再获取 UID 并更新
        const userId = await get_next_global_uid();
        const updatedUser = await UserDatabase.findByIdAndUpdate(
            user._id,
            { user_id: userId },
            { new: true }
        );

        res.status(201).send({
            message: "用户注册成功",
            user: {
                id: updatedUser._id,
                user_name: updatedUser.user_name,
                user_id: updatedUser.user_id
            }
        });
    } catch (error) {
        // 处理重复用户名错误
        if (error.code === 11000 && error.keyPattern?.user_name) {
            return res.status(422).send({
                message: "用户名已存在，请选择其他用户名",
                error: "USERNAME_EXISTS"
            });
        }
        
        // 处理其他验证错误
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(422).send({
                message: "输入信息验证失败",
                errors: errors
            });
        }
        
        // 记录未知错误并返回通用错误信息
        console.error("注册失败:", error);
        return res.status(500).send({
            message: "注册过程中发生未知错误，请稍后重试"
        });
    }
});

const rateLimit = require('express-rate-limit');

// 登录接口限流
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5, // 限制每个IP 15分钟内最多5次登录尝试
    message: "登录尝试次数过多，请稍后再试"
});

/**
 * @api {post} /api/login Login a user
 */
app.post("/api/login", loginLimiter, async (req, res) => {
    // 检查请求参数
    if (!req.body.user_name || !req.body.user_password) {
        return res.status(422).send({
            message: "用户名和密码不能为空"
        });
    }

    const user = await UserDatabase.findOne({
        user_name: req.body.user_name,
    });

    if (!user) {
        return res.status(422).send({
            message: "用户不存在",
        });
    }

    // 检查用户是否有密码字段
    if (!user.user_password) {
        console.error("用户文档缺少密码字段:", user._id);
        return res.status(500).send({
            message: "用户数据异常，请联系管理员"
        });
    }

    try {
        const isPasswordValid = require("bcrypt").compareSync(
            req.body.user_password,
            user.user_password
        );

        if (!isPasswordValid) {
            return res.status(422).send({
                message: "密码错误",
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
                user_id: user.user_id
            },
            token: token,
        });
    } catch (error) {
        console.error("密码验证失败:", error);
        return res.status(500).send({
            message: "验证过程中发生错误"
        });
    }
});

/**
 * 认证中间件
 */
const auth = async (req, res, next) => {
    try {
        // 检查 Authorization 头是否存在
        if (!req.headers.authorization) {
            return res.status(401).send({
                message: "未提供认证信息"
            });
        }

        // 解析 token
        const authHeader = req.headers.authorization;
        const parts = authHeader.split(" ");
        
        // 检查 Bearer token 格式
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).send({
                message: "认证格式错误"
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
                    message: "认证已过期"
                });
            }
            if (error.name === "JsonWebTokenError") {
                return res.status(401).send({
                    message: "无效的认证令牌"
                });
            }
            throw error; // 其他错误继续抛出
        }

        // 检查解码后的数据
        if (!decoded || !decoded.id) {
            return res.status(401).send({
                message: "无效的认证信息"
            });
        }

        // 查找用户
        const user = await UserDatabase.findById(decoded.id);
        if (!user) {
            return res.status(401).send({
                message: "用户不存在"
            });
        }

        // 将用户信息附加到请求对象
        req.user = user;
        next();
    } catch (error) {
        console.error("认证过程中发生错误:", error);
        return res.status(500).send({
            message: "认证过程中发生错误"
        });
    }
};

/**
 * @api {get} /api/profile Get user profile
 */
app.get("/api/profile", auth, async (req, res) => {
	res.send(req.user);
});

/**
 * 初始化服务器数据
 */
const initializeServerData = async () => {
    try {
        const server = await ServerDatabase.findOne({ server_name: "account" });
        if (!server) {
            await ServerDatabase.create({
                server_global_id: 10000,
                server_name: "account",
                server_global_user_counter: 9999
            });
            console.log("初始化服务器数据成功");
        }
    } catch (error) {
        console.error("初始化服务器数据失败:", error);
        throw error;
    }
};

/**
 * 启动服务器
 */
const startServer = async () => {
    try {
        await initializeServerData();
        app.listen(LISTEN_PORT, LISTEN_HOST, () => {
            console.log(`Server is running on http://${LISTEN_HOST}:${LISTEN_PORT}`);
        });
    } catch (error) {
        console.error("启动服务器失败:", error);
        process.exit(1);
    }
};

// 启动服务器
startServer();