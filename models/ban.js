const mongoose = require("mongoose");

const banSchema = new mongoose.Schema({
	user_id: { type: Number, required: true },
	ban_reason: { type: String, required: true },
    ban_time: { type: Date, required: true },
    unban_time: { type: Date, required: true },
});

module.exports = mongoose.model("Ban", banSchema);
