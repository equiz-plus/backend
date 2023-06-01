const jwt = require('jsonwebtoken');
const SECRETKEY = process.env.TOKEN_KEY;

const encrypt = (payload) => {
    return jwt.sign(payload, SECRETKEY);
};

const decrypt = (token) => {
    return jwt.verify(token, SECRETKEY);
};

module.exports = {
    encrypt,
    decrypt,
};