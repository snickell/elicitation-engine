var getConfig = require('./config').get;

module.exports = function () {
  return getConfig("BASE_URL");
}