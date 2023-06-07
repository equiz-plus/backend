const isLoggedIn = require("./authentication");
const { isAdmin } = require("./authorization");
const errorHandler = require("./errorHandler");

module.exports = {
  errorHandler,
  isLoggedIn,
  isAdmin,
};
