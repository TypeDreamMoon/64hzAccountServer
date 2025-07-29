# 64Hz Account Server

基于 Node.js + MongoDB + Express 的用户账户管理系统，提供基本的用户注册、登录、认证等功能。

---

## 功能特性

* 用户注册与登录
* JWT Token 认证机制
* 密码加密存储 (bcrypt)
* 请求频率限制
* 数据验证与错误处理
* 全局用户ID生成

技术栈
---

* Node.js
* Express.js
* MongoDB (通过 Mongoose)
* JSON Web Token (JWT)
* bcrypt (密码加密)
* dotenv (环境配置)

环境要求
----

* Node.js >= 12.x
* MongoDB >= 4.0

安装与配置
-----

1. 克隆项目仓库:

`git clone <repository-url> cd server_auth`

2. 安装依赖:

`npm install`

3. 创建 `.env` 文件并配置环境变量:

| 字段          | 干啥的                           |
| ----------- | ----------------------------- |
| SECRET      | JWT Key                       |
| DB_HOST     | 数据库主机                         |
| DB_PORT     | 数据库端口 MongoDB一般为`27017`       |
| DB_USE_AUTH | 数据库启用验证 0为不开 1为开              |
| DB_USE      | 登录用户  `DB_USE_AUTH = 1` 才有效   |
| DB_PASS     | 登录密码 `DB_USE_AUTH = 1` 才有效    |
| DB_NAME     | 登录数据库名称 `DB_USE_AUTH = 1` 才有效 |
| LISTEN_PORT | 监听端口 默认`3001`                 |
| LISTEN_HOST | 监听主机 默认`localhost`            |
| LOGIN_LIMITER_MAX | 登录限制最大次数 默认`5` |
| LOGIN_LIMITER_TIME | 登录限制时间 默认`5` 单位分钟 |

## 启动服务

`npm start` 或者 `node server.js`

## API接口

### 公共接口

| 接口        | 接口名称    | 干啥的    |
| --------- | ------- | ------ |
| GET /     | root    | 欢迎页    |
| GET /api/ | apiRoot | API欢迎页 |

### 用户相关接口

| 接口                         | 接口名称            | 干啥的                     |
| -------------------------- | --------------- | ----------------------- |
| POST /api/account/register | accountRegister | 用户注册                    |
| POST /api/account/login    | accountLogin    | 用户登录                    |
| GET /api/account/auth      | accountAuth     | 获取认证信息(传入 Bearer Token) |

数据模型
----

### 用户模型 (User)

| 字段                        | 类型      | 描述       |
| ------------------------- | ------- | -------- |
| user_name                 | String  | 用户名 (唯一) |
| user_password             | String  | 加密后的密码   |
| user_id                   | Number  | 全局用户ID   |
| user_login_disable        | Boolean | 是否禁用登录   |
| user_login_disable_reason | String  | 禁用登录原因   |

### 服务器模型 (Server)

| 字段                         | 类型     | 描述      |
| -------------------------- | ------ | ------- |
| server_name                | String | 服务器名称   |
| server_global_id           | Number | 服务器全局ID |
| server_global_user_counter | Number | 用户ID计数器 |

安全机制
----

1. **密码安全**: 使用 bcrypt 加密存储用户密码
2. **Token认证**: 使用 JWT 实现用户认证
3. **登录限制**: 每个IP地址15分钟内最多尝试登录5次
4. **输入验证**: 严格验证用户名和密码格式
5. **错误处理**: 统一错误处理，避免敏感信息泄露

用户名验证规则
-------

* 长度: 3-20个字符
* 只能包含: 字母、数字、下划线

密码验证规则
------

* 长度: 6-32个字符
* 只能包含: 字母、数字和特殊字符 (!@#$%^&*()_+-=[]{};':"|,.<>/?)

错误处理
----

系统提供详细的错误信息和对应的错误码，便于客户端处理各种异常情况。

### 常见错误类型

| 错误类型                         | 状态码 | 描述       |
| ---------------------------- | --- | -------- |
| DUPLICATE_KEY                | 422 | 重复键错误    |
| VALIDATION_ERROR             | 422 | 数据验证失败   |
| MISSING_FIELDS               | 422 | 缺少必要字段   |
| INVALID_USERNAME             | 422 | 无效用户名    |
| INVALID_PASSWORD             | 422 | 无效密码     |
| USERNAME_EXISTS              | 422 | 用户名已存在   |
| USER_NOT_FOUND               | 422 | 用户不存在    |
| INTERNAL_ERROR               | 500 | 内部服务器错误  |
| REGISTRATION_FAILED          | 500 | 注册失败     |
| USER_DATA_ERROR              | 500 | 用户数据异常   |
| AUTHENTICATION_ERROR         | 500 | 认证错误     |
| TOKEN_EXPIRED                | 401 | Token过期  |
| INVALID_TOKEN                | 401 | 无效Token  |
| MISSING_AUTHORIZATION        | 401 | 缺少认证信息   |
| INVALID_AUTHORIZATION_FORMAT | 401 | 认证格式错误   |
| INVALID_AUTHENTICATION_DATA  | 401 | 无效认证数据   |
| USER_ACCOUNT_DISABLED        | 403 | 用户账户被禁用  |
| USER_NOT_AUTHENTICATED       | 401 | 用户未认证    |
| INCOMPLETE_USER_DATA         | 500 | 用户数据不完整  |
| DATA_FORMAT_ERROR            | 500 | 数据格式错误   |
| AUTH_INFO_ERROR              | 500 | 获取认证信息错误 |

开发与调试
-----

`npm dev`

部署
--

可以部署到任何支持 Node.js 的服务器或云平台，如:

* Heroku
* AWS EC2
* DigitalOcean
* 阿里云ECS
* 腾讯云CVM

确保在生产环境中设置强密码和安全的JWT密钥。

联系方式
----

如有问题，请联系项目维护者。

email: 1067823908@qq.com

github: https://github.com/typeDreamMoon
