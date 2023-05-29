const { Op } = require("sequelize");
const { Question } = require('../models');

class questionController {

    static async index(req, res, next) {
        try {
            const { search } = req.query

            let whereCondition = {}
            if (search) {
                whereCondition = {
                    question: {
                        [Op.iLike]: `%${search}%`
                    }
                }
            }

            const { count, rows } = await Question.findAndCountAll({
                where: whereCondition
            })
            if (search && count <= 0) throw { name: 'NotFound' }
            res.status(200).json({
                count,
                questions: rows
            })
        } catch (err) {
            next(err)
        }
    }

    static async create(req, res, next) {
        try {
            const { question, option1, option2, option3, option4, answer, isPremium, explanation } = req.body
            const newQuestion = await Question.create({
                question,
                option1,
                option2,
                option3,
                option4,
                answer,
                isPremium,
                explanation
            })
            res.status(201).json(newQuestion)
        } catch (err) {
            next(err)
        }
    }

    static async edit(req, res, next) {
        try {
            const { id } = req.params
            const { question, option1, option2, option3, option4, answer, isPremium, explanation } = req.body
            if ((!question) && (!option1) && (!option2) && (!option3) && (!option4) && (!answer) && (!explanation)) throw { name: 'NothingUpdate' }

            const newQuestion = await Question.update({
                question,
                option1,
                option2,
                option3,
                option4,
                answer,
                isPremium,
                explanation
            }, {
                where: {
                    id
                }
            })

            if (newQuestion[0] <= 0) throw { name: 'NotFound' }

            res.status(200).json({
                message: 'Question has been updated'
            })
        } catch (err) {
            next(err)
        }
    }

    static async delete(req, res, next) {
        try {
            const id = req.params.id
            const question = await Question.destroy({
                where: {
                    id
                }
            })

            if (question <= 0) throw { name: 'NotFound' }

            res.status(200).json({
                message: `Question with id ${id} has been deleted`
            })
        } catch (err) {
            next(err)
        }
    }

}
module.exports = questionController