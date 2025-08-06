# 64Hz Account Server 项目文档

## 一、项目简介

本项目是一个基于 Node.js、Express 和 MongoDB 的用户账户管理服务，支持注册、登录、认证、封禁等基础功能，适用于游戏、应用等需要账号系统的场景。

---

## 二、技术架构

-   Node.js
-   Express.js
-   MongoDB (Mongoose)
-   JWT (认证)
-   bcrypt (密码加密)
-   dotenv (环境变量管理)

---

## 三、目录结构说明

```
server.js                # 主服务入口
src/
  middleware/            # Express 中间件
  models/                # 数据模型
  routes/                # 路由定义
  utils/                 # 工具函数
package.json             # 项目依赖与脚本
README.md                # 项目说明
API.md                   # API 接口文档
DOCS.md                  # 项目文档
```

---

## 四、环境变量说明

所有环境变量请配置在 `.env` 文件中，具体字段及说明见 README.md。

---

## 五、主要功能模块

1. **用户注册与登录**
    - 支持用户名、密码注册
    - 密码加密存储
    - 登录返回 JWT Token
2. **认证与鉴权**
    - 所有敏感操作需携带 Bearer Token
    - Token 校验与过期处理
3. **用户封禁管理**
    - 支持封禁/解封用户
    - 记录封禁原因与时间
4. **全局用户 ID 生成**
    - 保证用户 ID 唯一性
5. **安全机制**
    - 密码加密
    - 登录频率限制
    - 输入数据校验
    - 统一错误处理

---

## 六、启动与部署

1. 安装依赖：
    ```bash
    npm install
    ```
2. 配置环境变量：
   `.env` 文件参考 README.md
3. 启动服务：
    ```bash
    node server.js
    # 或
    npm start
    ```
4. 支持 HTTP/HTTPS，证书文件需自行生成或申请

---

## 七、测试

-   推荐使用 VS Code REST Client 插件

---

## 八、错误码说明

系统所有接口均返回统一错误码和错误信息，格式如下：

```json
{
	"code": "ERROR_CODE",
	"message": "错误信息"
}
```

常见错误码列表：

| 错误代码 (code)        | 错误信息 (message)                        |
| ---------------------- | ----------------------------------------- |
| MISSING_FIELDS         | 缺少必填字段。                            |
| INVALID_USERNAME       | 用户名格式不正确。                        |
| INVALID_PASSWORD       | 密码格式不正确。                          |
| USERNAME_EXISTS        | 用户名已存在。                            |
| TOO_MANY_REQUESTS      | 请求过于频繁，请稍后再试。                |
| USER_NOT_FOUND         | 用户不存在。                              |
| INVALID_CREDENTIALS    | 用户名或密码错误。                        |
| USER_BANNED            | 您的账号已被封禁。                        |
| BAN_NOT_FOUND          | 未找到封禁记录。                          |
| USER_NOT_AUTHENTICATED | 未提供认证 Token。                        |
| INVALID_AUTH_HEADER    | 错误的认证头格式，应为 Bearer `<token>`。 |
| INVALID_TOKEN          | 无效或已过期的 Token。                    |
| INTERNAL_ERROR         | 服务器内部错误，请稍后重试。              |
| VALIDATION_ERROR       | 数据验证失败                              |
| NORMAL                 | 正常                                      |

---

## 九、数据模型

### 用户模型（User）

| 字段          | 类型   | 描述           |
| ------------- | ------ | -------------- |
| user_name     | String | 用户名（唯一） |
| user_password | String | 加密后的密码   |
| user_id       | Number | 全局用户 ID    |

### 服务器模型（Server）

| 字段                       | 类型   | 描述           |
| -------------------------- | ------ | -------------- |
| server_name                | String | 服务器名称     |
| server_global_id           | Number | 服务器全局 ID  |
| server_global_user_counter | Number | 用户 ID 计数器 |

### 封禁模型（Ban）

| 字段       | 类型   | 描述          |
| ---------- | ------ | ------------- |
| user_id    | Number | 封禁的用户 ID |
| ban_reason | String | 封禁的原因    |
| ban_time   | Date   | 封禁的日期    |
| unban_time | Date   | 解封日期      |

---

## 环境变量

| 字段名             | 说明/用途                      | 是否必需 | 示例值/默认值       |
| ------------------ | ------------------------------ | -------- | ------------------- |
| SECRET             | JWT 密钥                       | 是       | my_jwt_secret       |
| DB_HOST            | MongoDB 主机地址               | 是       | localhost           |
| DB_PORT            | MongoDB 端口                   | 是       | 27017               |
| DB_USE_AUTH        | 是否启用数据库认证（0/1）      | 否       | 0                   |
| DB_USER            | 数据库用户名（认证开启时有效） | 否       | root                |
| DB_PASS            | 数据库密码（认证开启时有效）   | 否       | password            |
| DB_NAME            | 数据库名称                     | 是       | account_db          |
| HTTP_PORT          | HTTP 服务端口                  | 否       | 3000                |
| HTTPS_PORT         | HTTPS 服务端口                 | 否       | 3443                |
| ENABLE_HTTPS       | 是否启用 HTTPS（0/1）          | 否       | 1                   |
| SSL_KEY_PATH       | SSL 私钥文件路径               | 否       | localhost+2-key.pem |
| SSL_CERT_PATH      | SSL 证书文件路径               | 否       | localhost+2.pem     |
| LISTEN_HOST        | 监听主机                       | 否       | localhost           |
| LOGIN_LIMITER_MAX  | 登录限制最大次数               | 否       | 5                   |
| LOGIN_LIMITER_TIME | 登录限制时间（分钟）           | 否       | 5                   |
| DB_SERVER_NAME     | 服务器数据库名称（全局参数）   | 否       | account_server      |

如需详细接口参数、返回示例，请参考 [API.md](API.md)。
