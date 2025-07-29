const mongoose = require("mongoose");

const banSchema = new mongoose.Schema({
	user_id: { type: Number, required: true },
	ban_reason: { type: String, required: true },
});

module.exports = mongoose.model("Ban", banSchema);
