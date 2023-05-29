const isLoggedIn = require("./authentication");
const { isAdmin, isOwner } = require("./authorization");
const errorHandler = require("./errorHandler");

module.exports = {
    errorHandler,
    isLoggedIn,
    isAdmin,
    isOwner
}