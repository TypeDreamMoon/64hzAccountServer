const mongoose = require("mongoose");
require('dotenv').config();

if (process.env.DB_USE_AUTH == 1) {
	const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/`;
	mongoose.connect(url);
	console.log(`Connected to MongoDB at ${url}`);
} else {
	mongoose.connect(
		`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/`
	);
	console.log(`Connected to MongoDB at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
}

const UserSchema = new mongoose.Schema({
	// user name
	user_name: { type: String, unique: true },
	// user password
	user_password: {
		type: String,
		set(val) {
			return require("bcrypt").hashSync(val, 10);
		},
	},
	// user id
	user_id: { type: mongoose.Schema.Types.Number, default: 10000 },
	// user login disable
	user_login_disable: { type: Boolean, default: false },
	// user login disable reason
	user_login_disable_reason: { type: String, default: "" },
});

const UserDatabase = mongoose.model("User", UserSchema);

const ServerSchema = new mongoose.Schema({
	// server global id
	server_global_id: { type: mongoose.Schema.Types.Number, default: 10000 },
	// server name
	server_name: { type: String, default: "account" },
	// server global user counter
	server_global_user_counter: {
		type: mongoose.Schema.Types.Number,
		default: 9999,
	},
});

const ServerDatabase = mongoose.model("Server", ServerSchema);

module.exports = { UserDatabase, ServerDatabase };
