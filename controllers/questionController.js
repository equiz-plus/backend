const { Op } = require("sequelize");
const { Question, Answer, Category, sequelize } = require("../models");

class questionController {
  static async index(req, res, next) {
    try {
      const { page, CategoryId, displayLength, order, search } = req.query;

      let whereCondition = {};

      // set query length
      let pagination = +displayLength;
      if (!displayLength || isNaN(displayLength)) {
        pagination = 10;
      }

      // set search
      if (search) {
        whereCondition.question = {
          [Op.iLike]: `%${search}%`,
        };
      }

      // set sort
      let sortBy = "id";
      let sortOrder = order;

      if (!sortOrder || sortOrder !== "ASC") {
        sortOrder = "DESC";
      } else {
        sortOrder = "ASC";
      }

      let autoSort = [`${sortBy}`, `${sortOrder}`];

      console.log(autoSort, "INI SORTINGAN");

      // check if CategoryId input is correct
      if (CategoryId || !isNaN(CategoryId)) {
        whereCondition.CategoryId = +CategoryId;
      }

      console.log(whereCondition, "INI WHERE FINAL");

      // check if page number could be out of range
      const questionCount = await Question.count({
        where: whereCondition,
      });

      console.log(questionCount, "INI TOTAL QUESTIONS YANG DITEMUKAN");
      console.log(page, "INI PAGE SEBELUM CORRECTION");

      // page number correction
      const totalPages = Math.ceil(questionCount / pagination);
      console.log(totalPages, "INI TOTAL PAGES");

      let autoPage = 1;
      if (page > totalPages || totalPages === 0) {
        autoPage = totalPages;
      } else if (page < 1 || isNaN(page)) {
        autoPage = 1;
      } else {
        autoPage = +page;
      }

      console.log(autoPage, "INI FINAL AUTOPAGE");

      // offset correction
      let finalOffset = (+autoPage - 1) * pagination;
      if (finalOffset < 0) {
        finalOffset = 0;
      }

      // ini final query
      const questionsData = await Question.findAndCountAll({
        include: [
          {
            model: Category,
          },
        ],
        where: whereCondition,
        order: [autoSort],
        offset: finalOffset,
        limit: pagination,
      });

      res.status(200).json({
        currentPage: autoPage,
        totalPages: totalPages,
        totalExams: questionsData.count,
        exams: questionsData.rows,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    const generateQuestionTransaction = await sequelize.transaction();
    try {
      const { questionInput, answersInput } = req.body;

      const newQuestion = await Question.create(
        {
          question: questionInput.question,
          CategoryId: questionInput.CategoryId,
        },
        {
          transaction: generateQuestionTransaction,
        }
      );

      await Answer.bulkCreate(answersInput, {
        transaction: generateQuestionTransaction,
      });

      await generateQuestionTransaction.commit();

      res.status(201).json(newQuestion);
    } catch (err) {
      await generateQuestionTransaction.rollback();
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const question = await Question.destroy({
        where: {
          id,
        },
      });

      if (question <= 0) throw { name: "NotFound" };

      res.status(200).json({
        message: `Question with id ${id} has been deleted`,
      });
    } catch (err) {
      next(err);
    }
  }

  static async answerList(req, res, next) {
    try {
      const answer = await Answer.findAll();

      console.log(answer, "INI ANSWER");

      res.status(200).json(answer);
    } catch (err) {
      next(err);
    }
  }
}
module.exports = questionController;
