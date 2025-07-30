const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_name: { type: String, required: true, unique: true },
  user_password: { type: String, required: true },
  user_id: { type: Number, required: true, unique: true },
});

module.exports = mongoose.model('User', userSchema);