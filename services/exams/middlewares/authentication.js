const { decrypt } = require("../helpers")
const { User } = require('../models')

const isLoggedIn = async (req, res, next) => {
    try {
        const { access_token } = req.headers
        if (!access_token) throw { name: 'Forbidden' }
        const payload = decrypt(access_token)
        const user = await User.findByPk(payload.id)
        if (!user) throw { name: 'Forbidden' }
        if (user.role === 'guest') throw { name: 'isNotComfirm' }
        req.user = payload
        next()
    } catch (err) {
        next(err)
    }
}

module.exports = isLoggedIn