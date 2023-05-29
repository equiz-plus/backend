const express = require('express')
const { isLoggedIn, isAdmin, isOwner } = require('../middlewares')
const { gradeController } = require('../controllers')
const router = express.Router()

router.use(isLoggedIn)

router.get('/', isAdmin, gradeController.index)
router.get('/list', gradeController.userGrades)
router.get('/detail/:id', isOwner, gradeController.detail)
router.delete('/delete/:id', isAdmin, gradeController.delete)
router.get('/:id/detail/:gradeId', isOwner, gradeController.userGradesDetail)

module.exports = router