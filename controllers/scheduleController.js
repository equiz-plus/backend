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

      const now = new Date();
      const start = new Date(startingDate);
      const end = new Date(endDate);

      if (start > end) {
        throw { name: "InvalidDate" };
      } else if (start < now) {
        throw { name: "InvalidDate" };
      }

      if (!findExam) {
        throw { name: "NotFound" };
      }

      const schedule = await ExamSchedule.create({
        ExamId,
        startingDate: start,
        endDate: end,
      });

      res.status(201).json({
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

  static async editSchedule(req, res, next) {
    try {
      const { ExamId, startingDate, endDate } = req.body;
      const { id } = req.params;

      const findExam = await Exam.findOne({
        where: {
          id: ExamId,
        },
      });

      const now = new Date();
      const start = new Date(startingDate);
      const end = new Date(endDate);

      if (start > end) {
        throw { name: "InvalidDate" };
      } else if (start < now) {
        throw { name: "InvalidDate" };
      }

      if (!findExam) {
        throw { name: "NotFound" };
      }

      const schedule = await ExamSchedule.update(
        {
          ExamId,
          startingDate: start,
          endDate: end,
        },
        {
          where: {
            id: +id,
          },
        }
      );

      res.status(200).json({
        message: `Schedule for Exam ID ${ExamId} updated`,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSchedule(req, res, next) {
    try {
      const schedule = ExamSchedule.findAll();

      res.status(200).json(schedule);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = scheduleController;
