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
      const { id, ExamId, startingDate, endDate } = req.body;

      const findExam = await Exam.findOne({
        where: {
          id: +id,
        },
      });

      if (!findExam) {
        throw { name: "NotFound" };
      }

      const schedule = await ExamSchedule.create({
        ExamId,
        startingDate,
        endDate,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteSchedule(req, res, next) {
    try {
    } catch (err) {
      next(err);
    }
  }
}

module.exports = scheduleController;
