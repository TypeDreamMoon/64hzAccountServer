# 64Hz Account Server API 文档

所有接口路径均以 `/api` 开头，数据格式为 JSON。

---

## 公共接口

| 方法 | 路径    | 说明       | 认证 |
| ---- | ------- | ---------- | ---- |
| GET  | `/`     | 欢迎页     | 无   |
| GET  | `/api/` | API 欢迎页 | 无   |

---

## 用户相关接口

| 方法   | 路径                        | 说明           | 认证         |
| ------ | --------------------------- | -------------- | ------------ |
| POST   | `/api/account/register`     | 用户注册       | 无           |
| POST   | `/api/account/login`        | 用户登录       | 无           |
| GET    | `/api/account/auth`         | 获取认证信息   | Bearer Token |
| POST   | `/api/account/ban`          | 封禁用户       | Bearer Token |
| DELETE | `/api/account/ban/:user_id` | 删除封禁的用户 | Bearer Token |

---

## 请求示例

### 注册

```http
POST /api/account/register
Content-Type: application/json

{
  "user_name": "testuser",
  "user_password": "password123"
}
```

### 登录

```http
POST /api/account/login
Content-Type: application/json

{
  "user_name": "testuser",
  "user_password": "password123"
}
```

### 获取认证信息

```http
GET /api/account/auth
Authorization: Bearer <token>
```

### 封禁用户

```http
POST /api/account/ban
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 10001,
  "ban_reason": "违规操作",
  "ban_time": "2025-08-06T12:00:00Z",
  "unban_time": "2025-08-07T12:00:00Z"
}
```

### 删除封禁

```http
DELETE /api/account/ban/10001
Authorization: Bearer <token>
```

---

## 错误返回格式

所有接口均返回统一错误码和错误信息，格式如下：

```json
{
	"code": "ERROR_CODE",
	"message": "错误信息"
}
```

常见错误码请参考 [DOCS.md](DOCS.md)。
