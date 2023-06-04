const { Op } = require("sequelize");
const { Question, Answer, Category, sequelize } = require("../models");

class questionController {
  // show all questions
  // *admin
  static async index(req, res, next) {
    try {
      const { page, CategoryId, displayLength, order, search } = req.query;

      let whereCondition = {};

      // set query length
      let pagination = +displayLength;
      if (!displayLength || isNaN(displayLength) || displayLength < 1) {
        pagination = 10;
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
      if (!CategoryId || isNaN(CategoryId)) {
        whereCondition = {};
      } else {
        whereCondition.CategoryId = +CategoryId;
      }

      // set search
      if (search) {
        whereCondition.question = {
          [Op.iLike]: `%${search}%`,
        };
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
          {
            model: Answer,
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
        totalQuestions: questionsData.count,
        questions: questionsData.rows,
      });
    } catch (err) {
      next(err);
    }
  }

  // create questions and tags
  // *admin
  static async create(req, res, next) {
    const generateQuestionTransaction = await sequelize.transaction();
    try {
      const { questionInput, answersInput } = req.body;

      if (!questionInput || answersInput.length === 0) {
        throw { name: "InvalidInput" };
      }

      const newQuestion = await Question.create(
        {
          question: questionInput.question,
          CategoryId: questionInput.CategoryId,
        },
        {
          transaction: generateQuestionTransaction,
        }
      );

      let answersList = answersInput;
      answersList.forEach((answer) => {
        answer.QuestionId = newQuestion.id;
      });

      console.log(answersList, "INI FINAL ANSWERS LIST");

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

  // delete questions, also delete answers automatically
  // *admin
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const question = await Question.destroy({
        where: {
          id: +id,
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

  // get question
  // *admin
  static async getQuestionById(req, res, next) {
    try {
      const { id } = req.params;
      const question = await Question.findOne({
        where: {
          id: +id,
        },
        include: [
          {
            model: Answer,
          },
        ],
      });

      if (question <= 0) throw { name: "NotFound" };

      res.status(200).json(question);
    } catch (err) {
      next(err);
    }
  }

  // shows answer list
  // *admin
  static async answerList(req, res, next) {
    try {
      const { page, QuestionId, displayLength, order, search } = req.query;

      let whereCondition = {};

      // set query length
      let pagination = +displayLength;
      if (!displayLength || isNaN(displayLength || displayLength < 1)) {
        pagination = 10;
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

      // check if QuestionId input is correct
      if (!QuestionId || isNaN(QuestionId)) {
        whereCondition = {};
      } else {
        whereCondition.QuestionId = +QuestionId;
      }

      // set search
      if (search) {
        whereCondition.answer = {
          [Op.iLike]: `%${search}%`,
        };
      }

      console.log(whereCondition, "INI WHERE FINAL");

      // check if page number could be out of range
      const answersCount = await Answer.count({
        where: whereCondition,
      });

      console.log(answersCount, "INI TOTAL ANSWERS YANG DITEMUKAN");
      console.log(page, "INI PAGE SEBELUM CORRECTION");

      // page number correction
      const totalPages = Math.ceil(answersCount / pagination);
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
      const answersData = await Answer.findAndCountAll({
        where: whereCondition,
        order: [autoSort],
        offset: finalOffset,
        limit: pagination,
      });

      res.status(200).json({
        currentPage: autoPage,
        totalPages: totalPages,
        totalAnswers: answersData.count,
        answers: answersData.rows,
      });
    } catch (err) {
      next(err);
    }
  }
}
module.exports = questionController;
