# 64Hz Account Server

基于 Node.js + MongoDB + Express 的用户账户管理系统，支持注册、登录、认证、封禁等功能，适用于游戏、应用等需要账号系统的场景。

---

## 文档

- [DOCS.md](DOCS.md)
- [API.md](API.md)

## 功能特性

-   用户注册与登录
-   JWT Token 认证机制
-   密码加密存储（bcrypt）
-   登录频率限制
-   数据验证与错误处理
-   全局用户 ID 生成

---

## 技术栈

-   Node.js
-   Express.js
-   MongoDB（Mongoose）
-   JSON Web Token（JWT）
-   bcrypt
-   dotenv

---

## 环境要求

-   Node.js >= 12.x
-   MongoDB >= 4.0

---

## 安装与配置

1. 克隆项目仓库：
    ```bash
    git clone https://github.com/TypeDreamMoon/server_auth
    cd server_auth
    ```
2. 安装依赖：
    ```bash
    npm install
    ```
3. 创建 `.env` 文件并配置环境变量：

---

## 启动服务

```bash
npm start
# 或
node server.js
```

---

## 安全机制

1. **密码安全**：使用 bcrypt 加密存储用户密码
2. **Token 认证**：使用 JWT 实现用户认证
3. **登录限制**：每个 IP 地址在 `LOGIN_LIMITER_TIME` 分钟内最多尝试登录 `LOGIN_LIMITER_MAX` 次
4. **输入验证**：严格验证用户名和密码格式
5. **错误处理**：统一错误处理，避免敏感信息泄露

---

## 用户名与密码验证规则

-   用户名长度：3-20 个字符，仅允许字母、数字、下划线
-   密码长度：6-32 个字符，允许字母、数字和特殊字符（!@#$%^&\*()\_+-=[]{};':"|,.<>/?）

## 开发与调试

```bash
npm run dev
```

---

## 部署

可部署到任何支持 Node.js 的服务器或云平台，如：

-   Heroku
-   AWS EC2
-   DigitalOcean
-   阿里云 ECS
-   腾讯云 CVM

> 生产环境请务必设置强密码和安全的 JWT 密钥。

---

## 联系方式

如有问题，请联系项目维护者。

-   Email: 1067823908@qq.com
-   GitHub: https://github.com/typeDreamMoon
