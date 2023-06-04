const { Exam, Grade, Answer, UserAnswer, Question } = require("../models");
class gradeController {
  // find user grade by id
  // *admin
  static async userGradesById(req, res, next) {
    try {
      const { id } = req.params;

      const grade = await Grade.findOne({
        where: {
          id: +id,
        },
        include: {
          model: Exam,
        },
      });

      if (!grade) throw { name: "NotFound" };
      res.status(200).json(grade);
    } catch (err) {
      next(err);
    }
  }
  // show user own grades
  // *user
  static async showMyGrades(req, res, next) {
    try {
      const UserId = +req.user.id;
      const grades = await Grade.findAll({
        attributes: {
          exclude: ["isOpen"],
        },
        where: { UserId },
        include: {
          model: Exam,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      });

      res.status(200).json(grades);
    } catch (err) {
      next(err);
    }
  }

  // delete user grade
  // *admin
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const deleted = await Grade.destroy({
        where: {
          id: +id,
        },
      });

      if (deleted <= 0) throw { name: "NotFound" };

      res.status(200).json({
        message: `Grade with id ${id} has been deleted`,
      });
    } catch (err) {
      next(err);
    }
  }

  // show grade detail, with exams, questions, answers
  // *user
  static async myAnswer(req, res, next) {
    try {
      const { GradeId } = req.params;
      const { id } = req.user;
      const { page, displayLength, order } = req.query;

      // find specific grade
      const findGrade = await Grade.findByPk(+GradeId, {
        include: [
          {
            model: Exam,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        ],
      });

      if (!findGrade) {
        throw { name: "NotFound" };
      }

      // find exam

      let whereCondition = { UserId: +id, ExamId: +findGrade.ExamId };

      // set query length
      let pagination = +displayLength;
      if (!displayLength || isNaN(displayLength)) {
        pagination = 10;
      }

      // set sort
      let sortBy = "questionNumber";
      let sortOrder = order;

      if (!sortOrder || sortOrder !== "ASC") {
        sortOrder = "DESC";
      } else {
        sortOrder = "ASC";
      }

      let autoSort = [`${sortBy}`, `${sortOrder}`];

      console.log(autoSort, "INI SORTINGAN");

      console.log(whereCondition, "INI WHERE FINAL");

      // check if page number could be out of range
      const answerCount = await UserAnswer.count({
        where: whereCondition,
      });

      console.log(answerCount, "INI TOTAL ANSWER YANG DITEMUKAN");
      console.log(page, "INI PAGE SEBELUM CORRECTION");

      // page number correction
      const totalPages = Math.ceil(answerCount / pagination);
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
      const myAnswer = await UserAnswer.findAndCountAll({
        include: [
          {
            model: Question,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: Answer,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
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
        userScore: findGrade.grade,
        exam: findGrade.Exam,
        correctAnswers: findGrade.totalCorrect,
        totalAnswers: myAnswer.count,
        answers: myAnswer.rows,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = gradeController;
