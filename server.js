// server.js

const fs = require("fs");
const http = require("http");
const https = require("https");
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./src/routes");
require("dotenv").config();

// 应用初始化
const app = express();
app.use(express.json());
app.use("/api", routes);
console.log("[DEBUG] Routes mounted at /api");

// 环境变量与配置
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const ENABLE_HTTPS = process.env.ENABLE_HTTPS == 1;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || "./certs/localhost+2-key.pem";
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || "./certs/localhost+2.pem";
const DB_SERVER_NAME = process.env.DB_SERVER_NAME || "account_server";

const { DB_USE_AUTH, DB_USER, DB_NAME, DB_PASS, DB_HOST, DB_PORT } = process.env;
const MONGODB_URI = (DB_USE_AUTH === "1") ? `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}` : `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

console.log("[DEBUG] Configuration:", {
	HTTP_PORT,
	HTTPS_PORT,
	ENABLE_HTTPS,
	SSL_KEY_PATH,
	SSL_CERT_PATH,
	MONGODB_URI,
});

// 连接 MongoDB
mongoose
	.connect(MONGODB_URI, {})
	.then(async () => {
		console.log("[DEBUG] MongoDB connected");
		const { ServerDatabase } = require("./src/models");
		const collision = await ServerDatabase.findOne({
			server_name: "account_server",
		});
		if (!collision) {
			await ServerDatabase.create({
				server_name: DB_SERVER_NAME,
				server_global_id: 10000,
				server_global_user_counter: 9999,
			});
			console.log("[DEBUG] Server database initiailzied");
		} else {
			console.log("[DEBUG] Server database already exists");
		}
	})
	.catch((err) => {
		console.error("[ERROR] MongoDB connection error:", err);
		process.exit(1);
	});

// 启动服务器
if (ENABLE_HTTPS) {
	// HTTP 重定向到 HTTPS
	const httpServer = http.createServer((req, res) => {
		const host = req.headers.host.split(":")[0];
		const redirectUrl = `https://${host}:${HTTPS_PORT}${req.url}`;
		console.log("[DEBUG] Redirecting HTTP to:", redirectUrl);
		res.writeHead(301, { Location: redirectUrl });
		res.end();
	});
	httpServer.on("listening", () =>
		console.log(
			`[DEBUG] HTTP redirect server listening on port ${HTTP_PORT}`
		)
	);
	httpServer.on("error", (err) =>
		console.error("[ERROR] HTTP redirect server error:", err)
	);
	httpServer.listen(HTTP_PORT);

	// 读取 SSL 文件并启动 HTTPS
	let sslOptions;
	try {
		sslOptions = {
			key: fs.readFileSync(SSL_KEY_PATH),
			cert: fs.readFileSync(SSL_CERT_PATH),
		};
	} catch (err) {
		console.error("[ERROR] Failed to read SSL files:", err);
		process.exit(1);
	}

	const httpsServer = https.createServer(sslOptions, app);
	httpsServer.on("listening", () =>
		console.log(`[DEBUG] HTTPS server listening on port ${HTTPS_PORT}`)
	);
	httpsServer.on("error", (err) =>
		console.error("[ERROR] HTTPS server error:", err)
	);
	httpsServer.listen(HTTPS_PORT);
} else {
	// 仅 HTTP
	const httpServer = http.createServer(app);
	httpServer.on("listening", () =>
		console.log(`[DEBUG] HTTP server listening on port ${HTTP_PORT}`)
	);
	httpServer.on("error", (err) =>
		console.error("[ERROR] HTTP server error:", err)
	);
	httpServer.listen(HTTP_PORT);
}
