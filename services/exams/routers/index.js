const express = require('express')
const router = express.Router()
const user = require('./user.js')
const exams = require('./exams.js')
const questions = require('./questions.js')
const grades = require('./grades.js')

router.use('/user', user)
router.use('/exams', exams)
router.use('/questions', questions)
router.use('/grades', grades)

module.exports = router
