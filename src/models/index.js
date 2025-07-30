const User = require('./user');
const Server = require('./server');
const Ban = require('./ban');

module.exports = {
  UserDatabase: User,
  ServerDatabase: Server,
  BanDatabase: Ban
};