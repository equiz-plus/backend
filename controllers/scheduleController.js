const { Sequelize } = require("sequelize");
const {
  Exam,
  Question,
  QuestionGroup,
  Session,
  Answer,
  Grade,
  sequelize,
  UserAnswer,
  Category,
  Certificate,
  Organization,
  ExamSchedule,
} = require("../models");

class scheduleController {
  static async createSchedule(req, res, next) {
    try {
      const { ExamId, startingDate, endDate } = req.body;

      const findExam = await Exam.findOne({
        where: {
          id: ExamId,
        },
      });

      const start = new Date(startingDate);
      const end = new Date(endDate);

      if (!findExam) {
        throw { name: "NotFound" };
      }

      const schedule = await ExamSchedule.create({
        ExamId,
        startingDate: start,
        endDate: end,
      });

      res.status(200).json({
        schedule,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteSchedule(req, res, next) {
    try {
      const { id } = req.params;

      const deleteSchedule = await ExamSchedule.destroy({
        where: {
          id: +id,
        },
      });

      if (deleteSchedule <= 0) {
        throw { name: "NotFound" };
      }
    } catch (err) {
      next(err);
    }
  }

  // CRUD, INCLUDE EXAM LIST
  // IF END > START, ERROR EDIT
  // IF START < NOW, ERROR EDIT
}

module.exports = scheduleController;
