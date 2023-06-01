const { User } = require('../models')

const isAdmin = async (req, res, next) => {
    try {
        const { id } = req.user
        const user = await User.findByPk(+id)
        if (!user || (user.role !== 'admin')) throw { name: 'Forbidden' }
        next()
    } catch (err) {
        next(err)
    }
}

const isOwner = async (req, res, next) => {
    try {
        const userId = +req.params.id

        const { id, role } = req.user
        const user = await User.findByPk(userId)
        if (!user) throw { name: 'NotFound' }

        if ((id !== user.id) && (role !== 'admin')) throw { name: 'Forbidden' }
        next()
    } catch (err) {
        next(err)
    }
}


module.exports = {
    isAdmin,
    isOwner
}