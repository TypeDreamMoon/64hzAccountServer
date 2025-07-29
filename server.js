const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const routes = require("./routes");
const errorHandler = require("./middleware/error");
const { ServerDatabase } = require("./models");

const LISTEN_PORT = process.env.LISTEN_PORT || 3000;
const LISTEN_HOST = process.env.LISTEN_HOST || "0.0.0.0";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/account_server";
const SECRET = process.env.SECRET;

// 检查必要的环境变量
if (!SECRET) {
  console.error("错误: 未设置 SECRET 环境变量");
  process.exit(1);
}

const app = express();
app.use(express.json());

// MongoDB 连接
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("成功连接到 MongoDB:", MONGODB_URI);
  })
  .catch((error) => {
    console.error("MongoDB 连接失败:", error);
    process.exit(1);
  });

// 添加连接事件监听器
mongoose.connection.on('connecting', () => {
  console.log('正在连接到 MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB 连接已建立');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 连接已断开');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB 连接错误:', err);
});

// 路由
app.use("/api", routes);

// 错误处理中间件
app.use(errorHandler);

/**
 * 初始化服务器数据
 */
const initializeServerData = async () => {
  try {
    // 等待数据库连接
    if (mongoose.connection.readyState !== 1) {
      console.log("等待数据库连接...");
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('数据库连接超时'));
        }, 15000);
        
        if (mongoose.connection.readyState === 1) {
          clearTimeout(timeout);
          resolve();
        } else {
          mongoose.connection.once('connected', () => {
            clearTimeout(timeout);
            console.log('数据库连接已建立');
            resolve();
          });
        }
      });
    }
    
    const server = await ServerDatabase.findOne({ server_name: "account" });
    if (!server) {
      await ServerDatabase.create({
        server_global_id: 10000,
        server_name: "account",
        server_global_user_counter: 9999,
      });
      console.log("初始化服务器数据成功");
    } else {
      console.log("服务器数据已存在");
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
    const server = app.listen(LISTEN_PORT, LISTEN_HOST, () => {
      console.log(`Server is running on http://${LISTEN_HOST}:${LISTEN_PORT}`);
    });
    
    // 处理服务器关闭
    process.on('SIGINT', async () => {
      console.log('\n正在关闭服务器...');
      await mongoose.connection.close();
      server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("启动服务器失败:", error);
    process.exit(1);
  }
};

// 启动服务器
startServer();