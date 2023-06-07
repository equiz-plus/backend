const { Op } = require("sequelize");
const {
  Exam,
  Session,
  Category,
  Grade,
  ExamSchedule,
  User,
  Question,
  Certificate,
} = require("../models");

// list of exams
// *admin
class examController {
  static async examLists(req, res, next) {
    try {
      const { page, CategoryId, displayLength, sort, order, search } =
        req.query;

      let whereCondition = {};

      // set query length
      let pagination = +displayLength;
      if (!displayLength || isNaN(displayLength) || displayLength < 1) {
        pagination = 10;
      }

      // set sort
      let sortBy = sort;
      let sortOrder = order;

      if (!sortBy || sortBy !== "title") {
        sortBy = "id";
      } else {
        sortBy = "title";
      }

      if (!sortOrder || sortOrder !== "ASC") {
        sortOrder = "DESC";
      } else {
        sortOrder = "ASC";
      }

      let autoSort = [`${sortBy}`, `${sortOrder}`];

      // check if CategoryId input is correct
      if (!CategoryId || isNaN(CategoryId)) {
        whereCondition = {};
      } else {
        whereCondition.CategoryId = +CategoryId;
      }

      // set search
      if (search) {
        whereCondition.title = {
          [Op.iLike]: `%${search}%`,
        };
      }

      // check if page number could be out of range
      const examCount = await Exam.count({
        where: whereCondition,
      });

      // page number correction
      const totalPages = Math.ceil(examCount / pagination);

      let autoPage = 1;
      if (page > totalPages || totalPages === 0) {
        autoPage = totalPages;
      } else if (page < 1 || isNaN(page)) {
        autoPage = 1;
      } else {
        autoPage = +page;
      }

      // offset correction
      let finalOffset = (+autoPage - 1) * pagination;
      if (finalOffset < 0) {
        finalOffset = 0;
      }

      // ini final query
      const exams = await Exam.findAndCountAll({
        include: [
          {
            model: Category,
          },
          {
            model: ExamSchedule,
            require: false,
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
        totalExams: exams.count,
        exams: exams.rows,
      });
    } catch (err) {
      next(err);
    }
  }

  // create new exam
  // *admin
  static async create(req, res, next) {
    try {
      const {
        title,
        description,
        totalQuestions,
        duration,
        CategoryId,
        OrganizationId,
      } = req.body;

      if (totalQuestions < 5 || totalQuestions > 100)
        throw { name: "InvalidQuestions" };
      if (duration < 5 || duration > 180) throw { name: "InvalidDuration" };
      const exam = await Exam.create({
        title,
        description,
        totalQuestions,
        duration,
        CategoryId,
        isOpen: false,
        OrganizationId: OrganizationId,
      });
      res.status(201).json(exam);
    } catch (err) {
      next(err);
    }
  }

  // edit exam detail
  // *admin
  static async edit(req, res, next) {
    try {
      const { id } = req.params;

      // check first if there's any active session using the exam
      const activeSession = await Session.findAll({
        where: { ExamId: +id },
      });

      if (activeSession.length !== 0) {
        throw { name: "SessionExist" };
      }

      const {
        title,
        description,
        totalQuestions,
        duration,
        CategoryId,
        OrganizationId,
      } = req.body;

      if (!title && !description && !totalQuestions && !duration && !CategoryId)
        throw { name: "NothingUpdate" };

      if (totalQuestions) {
        if (totalQuestions < 5 || totalQuestions > 100)
          throw { name: "InvalidQuestions" };
      }
      if (duration) {
        if (duration < 5 || duration > 420) throw { name: "InvalidDuration" };
      }
      const exam = await Exam.update(
        {
          title,
          description,
          totalQuestions,
          duration,
          CategoryId,
          OrganizationId,
        },
        {
          where: {
            id,
          },
        }
      );

      if (exam[0] <= 0) throw { name: "NotFound" };

      res.status(200).json({
        message: "Exam has been updated",
      });
    } catch (err) {
      next(err);
    }
  }

  // opening exam for access, or closing exam
  // *admin
  static async changeVisibility(req, res, next) {
    try {
      const { id } = req.params;
      const exam = await Exam.findByPk(id);
      if (!exam) throw { name: "NotFound" };

      let isOpen = true;
      if (exam.isOpen === true) isOpen = false;

      await Exam.update(
        { isOpen },
        {
          where: { id },
        }
      );

      res.status(200).json({
        message: `Exam status now ${isOpen ? "open" : "close"}`,
      });
    } catch (err) {
      next(err);
    }
  }

  // delete exam
  // *admin
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      // check first if there's any active session using the exam
      const activeSession = await Session.findAll({
        where: { ExamId: +id },
      });

      if (activeSession.length !== 0) {
        throw { name: "SessionExist" };
      }

      // executing delete
      const exam = await Exam.destroy({
        where: {
          id,
        },
      });

      if (exam <= 0) throw { name: "NotFound" };

      res.status(200).json({
        message: `Exam with id ${id} has been deleted`,
      });
    } catch (err) {
      next(err);
    }
  }

  // show exam detail
  // *admin
  static async examDetail(req, res, next) {
    try {
      const { id } = req.params;

      const exams = await Exam.findOne({
        where: { id: +id },
      });

      if (!exams) throw { name: "NotFound" };

      res.status(200).json(exams);
    } catch (err) {
      next(err);
    }
  }

  //show statistics
  // *admin
  static async statistic(req, res, next) {
    try {
      //exams
      const totalExam = await Exam.count();
      // student
      const totalStudent = await User.count();
      // questions
      const totalQuestion = await Question.count();
      // certificate
      const totalCertificate = await Certificate.count();

      res.status(200).json({
        totalExam,
        totalStudent,
        totalQuestion,
        totalCertificate,
      });
    } catch (err) {
      next(err);
    }
  }
}
module.exports = examController;
