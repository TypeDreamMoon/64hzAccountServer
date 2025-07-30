const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  server_name: { type: String, required: true },
  server_global_id: { type: Number, required: true },
  server_global_user_counter: { type: Number, required: true }
});

module.exports = mongoose.model('Server', serverSchema);