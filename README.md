# 64Hz Account Server

基于 Node.js + MongoDB + Express 的用户账户管理系统，提供基本的用户注册、登录、认证、封禁等功能。

---

## 功能特性

- 用户注册与登录
- JWT Token 认证机制
- 密码加密存储 (bcrypt)
- 请求频率限制
- 数据验证与错误处理
- 全局用户 ID 生成

## 技术栈

- Node.js
- Express.js
- MongoDB (通过 Mongoose)
- JSON Web Token (JWT)
- bcrypt (密码加密)
- dotenv (环境配置)

## 环境要求

- Node.js >= 12.x
- MongoDB >= 4.0

## 安装与配置

1. 克隆项目仓库:

`git clone https://github.com/TypeDreamMoon/server_auth & cd server_auth`

2. 安装依赖:

`npm install`

3. 创建  `.env`  文件并配置环境变量:

| 字段                 | 干啥的                            |
| ------------------ | ------------------------------ |
| SECRET             | JWT Key                        |
| DB_HOST            | 数据库主机                          |
| DB_PORT            | 数据库端口 MongoDB 一般为`27017`       |
| DB_USE_AUTH        | 数据库启用验证 0 为不开 1 为开             |
| DB_USE             | 登录用户   `DB_USE_AUTH = 1`  才有效  |
| DB_PASS            | 登录密码 `DB_USE_AUTH = 1`  才有效    |
| DB_NAME            | 登录数据库名称 `DB_USE_AUTH = 1`  才有效 |
| HTTP_PORT          | HTTP服务端口                       |
| HTTPS_PORT         | HTTPS服务端口                      |
| ENABLE_HTTPS       | 启用HTTPS 0关1开                   |
| SSL_KEY_PATH       | SSL Key 地址                     |
| SSL_CERT_PATH      | SSL 证书地址                       |
| LISTEN_HOST        | 监听主机 默认`localhost`             |
| LOGIN_LIMITER_MAX  | 登录限制最大次数 默认`5`                 |
| LOGIN_LIMITER_TIME | 登录限制时间 默认`5` 单位分钟              |

## 启动服务

`npm start` 或者 `node server.js`

## API 接口

### 公共接口

| 接口        | 接口名称    | 干啥的     |
| --------- | ------- | ------- |
| GET /     | root    | 欢迎页     |
| GET /api/ | apiRoot | API 欢迎页 |

### 用户相关接口

| 方式     | 接口                        | 接口名称             | 干啥的                     |
| ------ |:------------------------- | ---------------- | ----------------------- |
| POST   | /api/account/register     | accountRegister  | 用户注册                    |
| POST   | /api/account/login        | accountLogin     | 用户登录                    |
| GET    | /api/account/auth         | accountAuth      | 获取认证信息(传入 Bearer Token) |
| POST   | /api/account/ban          | accountBan       | 封禁用户                    |
| DELETE | /api/account/ban/:user_id | accountDeleteBan | 删除封禁的用户                 |

## 数据模型

### 用户模型 (User)

**目的**: `记录用户数据`

| 字段            | 类型     | 描述       |
| ------------- | ------ | -------- |
| user_name     | String | 用户名 (唯一) |
| user_password | String | 加密后的密码   |
| user_id       | Number | 全局用户 ID  |

### 服务器模型 (Server)

**目的**: `存储一些全局参数`

| 字段                         | 类型     | 描述        |
| -------------------------- | ------ | --------- |
| server_name                | String | 服务器名称     |
| server_global_id           | Number | 服务器全局 ID  |
| server_global_user_counter | Number | 用户 ID 计数器 |

### 封禁模型(Ban)

**目的**: `记录谁封禁了`

| 字段         | 类型     | 描述      |
| ---------- | ------ | ------- |
| user_id    | Number | 封禁的用户ID |
| ban_reason | String | 封禁的原因   |
| ban_time   | Date   | 封禁的日期   |
| unban_time | Date   | 解封日期    |

## 安全机制

1. **密码安全**: 使用 bcrypt 加密存储用户密码
2. **Token 认证**: 使用 JWT 实现用户认证
3. **登录限制**: 每个 IP 地址 `Env:LOGIN_LIMITER_TIME` 分钟内最多尝试登录 `Env:LOGIN_LIMITER_MAX` 次
4. **输入验证**: 严格验证用户名和密码格式
5. **错误处理**: 统一错误处理，避免敏感信息泄露

## 用户名验证规则

- 长度: 3-20 个字符
- 只能包含: 字母、数字、下划线

## 密码验证规则

- 长度: 6-32 个字符
- 只能包含: 字母、数字和特殊字符 (!@#$%^&\*()\_+-=[]{};':"|,.<>/?)

## 错误处理

系统提供详细的错误信息和对应的错误码，便于客户端处理各种异常情况。

### 常见错误类型

**定义地址**: `./src/utils/errors.js`

| 错误代码 (code)            | 错误信息 (message)              |
| ---------------------- | --------------------------- |
| MISSING_FIELDS         | 缺少必填字段。                     |
| INVALID_USERNAME       | 用户名格式不正确。                   |
| INVALID_PASSWORD       | 密码格式不正确。                    |
| USERNAME_EXISTS        | 用户名已存在。                     |
| TOO_MANY_REQUESTS      | 请求过于频繁，请稍后再试。               |
| USER_NOT_FOUND         | 用户不存在。                      |
| INVALID_CREDENTIALS    | 用户名或密码错误。                   |
| USER_BANNED            | 您的账号已被封禁。                   |
| BAN_NOT_FOUND          | 未找到封禁记录。                    |
| USER_NOT_AUTHENTICATED | 未提供认证 Token。                |
| INVALID_AUTH_HEADER    | 错误的认证头格式，应为 Bearer <token>。 |
| INVALID_TOKEN          | 无效或已过期的 Token。              |
| INTERNAL_ERROR         | 服务器内部错误，请稍后重试。              |
| VALIDATION_ERROR       | 数据验证失败                      |
| NORMAL                 | 正常                          |

## 开发与调试

`npm dev`

## 部署

可以部署到任何支持 Node.js 的服务器或云平台，如:

- Heroku
- AWS EC2
- DigitalOcean
- 阿里云 ECS
- 腾讯云 CVM

确保在生产环境中设置强密码和安全的 JWT 密钥。

## 联系方式

如有问题，请联系项目维护者。

email: 1067823908@qq.com

github: https://github.com/typeDreamMoon
