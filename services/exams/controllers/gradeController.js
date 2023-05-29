const { Exam, Grade, Answer, Question } = require('../models')
class gradeController {
    static async index(req, res, next) {
        try {
            const grades = await Grade.findAll()
            res.status(200).json(grades)
        } catch (err) {
            next(err)
        }
    }

    static async detail(req, res, next) {
        try {
            const { id } = req.params

            const grade = await Grade.findOne({
                where: {
                    id: +id
                },
                include: {
                    model: Exam,
                    include: {
                        model: Answer,
                        include: Question
                    }
                }

            })

            if (!grade) throw { name: 'NotFound' }
            res.status(200).json(grade)
        } catch (err) {
            next(err)
        }
    }

    static async userGrades(req, res, next) {
        try {
            const UserId = +req.user.id
            const grades = await Grade.findAll(
                {
                    where: { UserId },
                    include: Exam,
                }

            )

            res.status(200).json(grades)
        } catch (err) {
            next(err)
        }
    }

    static async userGradesDetail(req, res, next) {
        try {
            const UserId = +req.user.id
            const { gradeId } = req.params

            const grade = await Grade.findOne({
                where: {
                    id: +gradeId,
                    UserId
                },
            })
            if (!grade) throw { name: 'NotFound' }
            res.status(200).json(grade)
        } catch (err) {
            next(err)
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params

            const deleted = await Grade.destroy({
                where: {
                    id: +id
                }
            })

            if (deleted <= 0) throw { name: 'NotFound' }

            res.status(200).json({
                message: `Grade with id ${id} has been deleted`
            })
        } catch (err) {
            next(err)
        }
    }

}

module.exports = gradeController