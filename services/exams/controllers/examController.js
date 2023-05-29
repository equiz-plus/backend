const { Op, Sequelize } = require("sequelize");
const { Exam, Question, QuestionGroup, Session, Answer, Grade } = require('../models');
const { pinGenerator } = require("../helpers");


class examController {

    static async index(req, res, next) {
        try {
            const { search } = req.query

            let whereCondition = {}
            if (search) {
                whereCondition = {
                    title: {
                        [Op.iLike]: `%${search}%`
                    }
                }
            }

            const { count, rows } = await Exam.findAndCountAll({
                where: whereCondition
            })
            if (search && count <= 0) throw { name: 'NotFound' }
            res.status(200).json({
                count,
                exams: rows
            })
        } catch (err) {
            next(err)
        }
    }

    static async indexForUser(req, res, next) {
        try {
            const { search } = req.query

            let whereCondition = {}
            if (search) {
                whereCondition = {
                    title: {
                        [Op.iLike]: `%${search}%`
                    }
                }
            }

            const { count, rows } = await Exam.findAndCountAll({
                where: whereCondition,
            })
            if (search && count <= 0) throw { name: 'NotFound' }
            res.status(200).json({
                count,
                exams: rows
            })
        } catch (err) {
            next(err)
        }
    }

    static async create(req, res, next) {
        try {
            const { title, description, totalQuestions, duration, isPremium, closingDate } = req.body
            if (totalQuestions < 5 || totalQuestions > 100) throw { name: 'InvalidQuestions' }
            if (duration < 5 || duration > 180) throw { name: 'InvalidDuration' }
            const exam = await Exam.create({
                title,
                description,
                totalQuestions,
                duration,
                isPremium,
                isOpen: false,
                closingDate,
                pin: pinGenerator()
            })
            res.status(201).json(exam)
        } catch (err) {
            next(err)
        }
    }

    static async detailForUser(req, res, next) {
        try {
            const { id } = req.params
            const exams = await Exam.findOne({
                where: { id },
                attributes: {
                    exclude: ['pin']
                }
            })
            if (!exams) throw { name: 'NotFound' }
            res.status(200).json(exams)
        } catch (err) {
            next(err)
        }
    }

    static async edit(req, res, next) {
        try {
            const { id } = req.params
            const { title, description, totalQuestions, duration, isPremium, closingDate } = req.body
            if ((!title) && (!description) && (!totalQuestions) && (!duration)) throw { name: 'NothingUpdate' }
            if (totalQuestions) {
                if (totalQuestions < 5 || totalQuestions > 100) throw { name: 'InvalidQuestions' }
            }
            if (duration) {
                if (duration < 5 || duration > 180) throw { name: 'InvalidDuration' }
            }
            const exam = await Exam.update({
                title,
                description,
                totalQuestions,
                duration,
                isPremium,
                closingDate,
            }, {
                where: {
                    id
                }
            })

            if (exam[0] <= 0) throw { name: 'NotFound' }

            res.status(200).json({
                message: 'Exam has been updated'
            })
        } catch (err) {
            next(err)
        }
    }

    static async changeVisibility(req, res, next) {
        try {
            const { id } = req.params
            const exam = await Exam.findByPk(id)
            if (!exam) throw { name: 'NotFound' }

            let isOpen = true
            if (exam.isOpen === true) isOpen = false

            await Exam.update(
                { isOpen },
                {
                    where: { id }
                })

            res.status(200).json({
                message: `Exam status now ${isOpen ? 'open' : 'close'}`
            })
        } catch (err) {
            next(err)
        }
    }

    static async changeStatus(req, res, next) {
        try {
            const { id } = req.params
            const exam = await Exam.findByPk(id)
            if (!exam) throw { name: 'NotFound' }

            let isPremium = true
            if (exam.isPremium === true) isPremium = false

            await Exam.update(
                { isPremium },
                {
                    where: { id }
                })

            res.status(200).json({
                message: `Exam status now ${isPremium ? 'Premium' : 'Free'}`
            })
        } catch (err) {
            next(err)
        }
    }

    static async generateNewPin(req, res, next) {
        try {
            const { id } = req.params
            const exam = await Exam.findByPk(id)
            if (!exam) throw { name: 'NotFound' }

            const pin = pinGenerator()

            await Exam.update(
                { pin },
                {
                    where: { id }
                })

            res.status(200).json({
                message: `New pin = ${pin}`
            })
        } catch (err) {
            next(err)
        }
    }

    static async delete(req, res, next) {
        try {
            const id = req.params.id
            const exam = await Exam.destroy({
                where: {
                    id
                }
            })

            if (exam <= 0) throw { name: 'NotFound' }

            res.status(200).json({
                message: `Exam with id ${id} has been deleted`
            })
        } catch (err) {
            next(err)
        }
    }

    static async start(req, res, next) {
        try {
            const { id, isPremium } = req.user
            const ExamId = req.params.id
            const { pin } = req.body
            const exam = await Exam.findByPk(+ExamId)
            if (!exam) throw { name: 'NotFound' }
            if (!exam.isOpen) throw { name: 'ExamClose' }
            if (exam.isPremium && !isPremium) throw { name: 'PremiumExam' }
            if (pin !== exam.pin) throw { name: 'InvalidPin' }

            let WhereCondition;

            if (exam.isPremium) {
                WhereCondition = true
            } else {
                WhereCondition = false
            }

            const exsitsGrade = await Grade.findOne({
                where: {
                    ExamId,
                    UserId: id
                }
            })

            if (exsitsGrade) throw { name: 'ExamTaken' }

            await Grade.create({
                totalQuestions: exam.totalQuestions,
                totalCorrect: 0,
                grade: 0,
                ExamId,
                UserId: id
            })

            const randomQuestions = await Question.findAll({
                where: {
                    isPremium: WhereCondition
                },
                order: [[Sequelize.fn('RANDOM')]],
                limit: exam.totalQuestions,
            })

            let timeStop = ((new Date().getTime()) + (exam.duration * 60000))

            timeStop = new Date(timeStop)

            const session = await Session.create({
                timeStop,
                ExamId,
                UserId: id
            })

            await QuestionGroup.destroy({
                where: {
                    UserId: id
                }
            })

            let questionGroups = []
            let questionNumber = 1
            randomQuestions.forEach(el => {
                questionGroups.push({
                    questionNumber,
                    SessionId: session.id,
                    UserId: id,
                    QuestionId: el.id
                })
                questionNumber++
            });


            await QuestionGroup.bulkCreate(questionGroups)

            const examination = await Session.findAll({
                where: {
                    id: session.id
                },
                include: [
                    Exam,
                    {
                        model: QuestionGroup,
                        include: {
                            model: Question,
                            attributes:
                                { exclude: ['answer', 'explanation'] }

                        }
                    },
                ]
            })

            res.status(200).json({
                examination
            })


        } catch (err) {
            next(err)
        }
    }

    static async answer(req, res, next) {
        try {
            const UserId = +req.user.id
            const questionNumber = +req.params.questionNumber
            const { answer } = req.body

            const question = await QuestionGroup.findOne({
                where: {
                    UserId: UserId,
                    questionNumber: questionNumber
                },
                include: [
                    {
                        model: Question
                    },
                    {
                        model: Session
                    },
                ]
            })

            if (!question) throw { name: 'NotFound' }

            const getGrade = await Grade.findOne({
                where: {
                    ExamId: question.Session.ExamId,
                    UserId
                }
            })

            let totalCorrect = getGrade.totalCorrect
            let totalQuestions = getGrade.totalQuestions
            let correctAnswer
            let isCorrect = false

            if (question.Question.answer === "1") correctAnswer = question.Question.option1
            if (question.Question.answer === "2") correctAnswer = question.Question.option2
            if (question.Question.answer === "3") correctAnswer = question.Question.option3
            if (question.Question.answer === "4") correctAnswer = question.Question.option4

            if (answer === question.Question.answer) {
                isCorrect = true
            }



            if (new Date(question.Session.timeStop) < new Date()) {
                await QuestionGroup.destroy({
                    where: {
                        UserId
                    }
                })
                throw { name: 'TimeOver' }
            }

            const answerExsists = await Answer.findOne({
                where: {
                    QuestionNumber: questionNumber,
                    UserId
                }
            })



            if (!answerExsists) {
                await Answer.create({
                    answer,
                    QuestionNumber: questionNumber,
                    isCorrect,
                    ExamId: question.Session.ExamId,
                    QuestionId: question.QuestionId,
                    UserId
                })

                if (isCorrect) {
                    totalCorrect++
                }
            } else {
                if (answerExsists.isCorrect) {
                    if (!isCorrect) {
                        totalCorrect--
                    }
                } else {
                    if (isCorrect) {
                        totalCorrect++
                    }
                }
                await Answer.update({
                    answer,
                    isCorrect,
                }, {
                    where: {
                        QuestionNumber: questionNumber,
                        UserId
                    }
                })
            }

            let finalGrade = (totalCorrect / totalQuestions * 100)

            await Grade.update({
                totalCorrect,
                grade: finalGrade
            }, {
                where: {
                    ExamId: question.Session.ExamId,
                    UserId
                }
            })

            res.status(200).json({
                number: questionNumber,
                question: question.Question.question,
                yourAnswer: answer,
                ExamId: question.Session.ExamId
            })


        } catch (err) {
            next(err)
        }
    }

    static async getSession(req, res, next) {
        try {
            const UserId = +req.user.id
            const examination = await Session.findOne({
                where: {
                    UserId: UserId
                },
                include: [
                    Exam,
                    {
                        model: QuestionGroup,
                        include: {
                            model: Question,
                            attributes:
                                { exclude: ['answer', 'explanation'] }

                        }
                    },
                ]
            })
            res.status(200).json(examination)
        } catch (err) {
            next(err)
        }
    }

    static async getQuestion(req, res, next) {
        try {
            const UserId = +req.user.id
            const question = await QuestionGroup.findAll({
                where: {
                    UserId: UserId
                },
                include: [{
                    model: Question,
                    attributes:
                        { exclude: ['answer', 'explanation'] }

                }, {
                    model: Session,
                }
                ],
                order: [
                    ['questionNumber', 'ASC'],
                ],
            })
            res.status(200).json(question)
        } catch (err) {
            next(err)
        }
    }

    static async myAnswer(req, res, next) {
        try {
            const ExamId = +req.params.examId
            const UserId = +req.user.id
            const answers = await Answer.findAll({
                where: {
                    UserId: UserId,
                    ExamId: ExamId
                },
                include: {
                    model: Question,
                    attributes:
                        { exclude: ['answer', 'explanation'] }

                },
                order: [
                    ['QuestionNumber', 'ASC'],
                ],
            })
            res.status(200).json(answers)
        } catch (err) {
            next(err)
        }
    }

    static async myAnswerDetail(req, res, next) {
        try {
            const QuestionNumber = +req.params.questionNumber
            const UserId = +req.user.id
            const answers = await Answer.findOne({
                where: {
                    UserId: UserId,
                    QuestionNumber: QuestionNumber
                },
                include: {
                    model: Question,
                    attributes:
                        { exclude: ['answer', 'explanation'] }

                },
            })
            res.status(200).json(answers)
        } catch (err) {
            next(err)
        }
    }

}
module.exports = examController