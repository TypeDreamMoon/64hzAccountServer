const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  server_name: { type: String, required: true, default: 'account_server' },
  server_global_id: { type: Number, required: true, unique: true, default: 10000 },
  server_global_user_counter: { type: Number, required: true, default: 9999 }
});

module.exports = mongoose.model('Server', serverSchema);