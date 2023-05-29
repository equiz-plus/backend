const express = require('express')
const { userController } = require('../controllers')
const { isLoggedIn, isAdmin, isOwner } = require('../middlewares')
const router = express.Router()
const uploader = require('../helpers/multer');



router.get('/', isLoggedIn, isAdmin, userController.index)
router.delete('/:id', isLoggedIn, isAdmin, userController.delete)
router.post('/upload', isLoggedIn, uploader.single('file'), userController.uploadFile)
router.post('/register', userController.register)
router.post('/generate-subscription-token', isLoggedIn, userController.generateMitransToken)
router.patch('/subscription', isLoggedIn, userController.subscription)
router.post('/login', userController.login)
router.post('/confirmation', userController.confirmation)
router.put('/edit', isLoggedIn, userController.userEdit)
router.get('/profile', isLoggedIn, userController.userDetail)
router.get('/detail/:id', isLoggedIn, isOwner, userController.detail)
router.put('/setting/:id', isLoggedIn, isOwner, userController.edit)

module.exports = router