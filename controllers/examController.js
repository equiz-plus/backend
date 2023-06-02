const { Op, Sequelize } = require("sequelize");
const {
  Exam,
  Question,
  QuestionGroup,
  Session,
  Answer,
  Grade,
  sequelize,
  UserAnswer,
} = require("../models");

// list of exams
// *admin
class examController {
  static async examLists(req, res, next) {
    try {
      const { search } = req.query;

      let whereCondition = {};

      if (search) {
        whereCondition = {
          title: {
            [Op.iLike]: `%${search}%`,
          },
        };
      }

      const { count, rows } = await Exam.findAndCountAll({
        where: whereCondition,
      });
      if (search && count <= 0) throw { name: "NotFound" };
      res.status(200).json({
        count,
        exams: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  // create new exam
  // *admin
  static async create(req, res, next) {
    try {
      const { title, description, totalQuestions, duration, CategoryId } =
        req.body;

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

      if (activeSession) {
        throw { name: "SessionExist" };
      }

      const {
        title,
        description,
        totalQuestions,
        duration,
        isPremium,
        closingDate,
      } = req.body;
      if (!title && !description && !totalQuestions && !duration)
        throw { name: "NothingUpdate" };
      if (totalQuestions) {
        if (totalQuestions < 5 || totalQuestions > 100)
          throw { name: "InvalidQuestions" };
      }
      if (duration) {
        if (duration < 5 || duration > 180) throw { name: "InvalidDuration" };
      }
      const exam = await Exam.update(
        {
          title,
          description,
          totalQuestions,
          duration,
          isPremium,
          closingDate,
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

      if (activeSession) {
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
  // *both
  static async examDetail(req, res, next) {
    try {
      const { id } = req.params;
      const exams = await Exam.findOne({
        where: { id },
      });
      if (!exams) throw { name: "NotFound" };
      res.status(200).json(exams);
    } catch (err) {
      next(err);
    }
  }

  // list of exams. Only shows open exam.
  // *user
  static async examListsUser(req, res, next) {
    try {
      const { search } = req.query;

      let whereCondition = {};

      if (search) {
        whereCondition = {
          title: {
            [Op.iLike]: `%${search}%`,
          },
          isOpen: true,
        };
      } else {
        whereCondition = {
          isOpen: true,
        };
      }

      const { count, rows } = await Exam.findAndCountAll({
        where: whereCondition,
      });
      if (search && count <= 0) throw { name: "NotFound" };
      res.status(200).json({
        count,
        exams: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  // begin EXAM
  // *user
  static async start(req, res, next) {
    const generateExamTransaction = await sequelize.transaction();
    try {
      const { id } = req.user;
      const ExamId = req.params.id;

      // check first if user is already in exam
      const activeSession = await Session.findAll({
        where: { UserId: +id },
      });

      console.log(activeSession), "INI ACTIVE SESSION";

      if (activeSession.length !== 0) {
        // check if time has ended
        const now = new Date();

        if (activeSession[0].timeStop <= now) {
          await Session.destroy({
            where: {
              UserId: +id,
            },
          });
          throw { name: "TimeOver" };
        } else throw { name: "InExam" };
      }

      // check if exam exists
      const exam = await Exam.findByPk(+ExamId);

      console.log(exam, "INI EXAM YANG DICARI");

      if (!exam) throw { name: "NotFound" };
      if (!exam.isOpen) throw { name: "ExamClose" };

      // initializing exam session
      // ensure student never attends exam
      const gradeExist = await Grade.findOne({
        where: {
          ExamId,
          UserId: id,
        },
      });

      console.log(gradeExist, "INI GRADE USER EXISTING");

      if (gradeExist) throw { name: "ExamTaken" };

      // if never take, create new grade entry
      const newGrade = await Grade.create(
        {
          totalIncorrect: 0,
          totalCorrect: 0,
          grade: 0,
          ExamId,
          UserId: id,
        },
        {
          transaction: generateExamTransaction,
        }
      );

      console.log(newGrade, "INI GRADE USER BARU JIKA TAK EXISTING");

      // generate exam ending time
      let timeStop = new Date().getTime() + exam.duration * 60000;
      timeStop = new Date(timeStop);

      console.log(timeStop, "INI TIMESTOP SESSION");

      // get random questions for exam
      const randomQuestions = await Question.findAll(
        {
          where: {
            CategoryId: +exam.CategoryId,
          },
        },
        {
          order: [[Sequelize.fn("RANDOM")]],
          limit: exam.totalQuestions,
        }
      );

      console.log(randomQuestions, "INI RANDOM QUESTIONS");

      if (randomQuestions.length <= 0) {
        throw { name: "NoQuestion" };
      }

      // create exam session
      const session = await Session.create(
        {
          timeStop,
          ExamId,
          UserId: id,
        },
        {
          transaction: generateExamTransaction,
        }
      );

      console.log(session, "INI SESSION EXAM YANG DIBUAT BARU");

      // menyiapkan questions yang unique utk user
      let questionGroups = [];
      let questionNumber = 1;
      randomQuestions.forEach((el) => {
        questionGroups.push({
          questionNumber,
          SessionId: session.id,
          QuestionId: el.id,
        });
        questionNumber++;
      });

      await QuestionGroup.bulkCreate(questionGroups, {
        transaction: generateExamTransaction,
      });

      await generateExamTransaction.commit();

      res.status(200).json({
        message: `Exam started for user ${id}`,
        // activeSession: activeSession,
        // exam: exam,
        // createdGrade: newGrade,
        // endTime: timeStop,
        // createdSession: session,
      });
    } catch (err) {
      await generateExamTransaction.rollback();
      next(err);
    }
  }

  // checking on current exam session, in case of power failure
  // *user
  static async getSession(req, res, next) {
    try {
      const UserId = +req.user.id;
      const activeSession = await Session.findOne({
        where: {
          UserId: UserId,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        include: [
          {
            model: Exam,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: QuestionGroup,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: {
              model: Question,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          },
        ],
      });

      if (!activeSession) {
        throw { name: "NotFound" };
      }

      res.status(200).json(activeSession);
    } catch (err) {
      next(err);
    }
  }

  // user wanted to end the exam early
  // *user
  static async endExam(req, res, next) {
    try {
      const { id } = req.user;

      // check first if user is already in exam
      const activeSession = await Session.findAll({
        where: { UserId: +id },
      });

      if (activeSession.length === 0) {
        throw { name: "NotFound" };
      } else {
        // execute ending session
        await Session.destroy({
          where: {
            UserId: +id,
          },
        });
      }

      res.status(200).json({
        message: `User ${id} current exam has ended`,
      });
    } catch (err) {
      next(err);
    }
  }

  // answering the question
  // *user
  static async answer(req, res, next) {
    try {
      const { id } = req.user;
      const questionNumber = +req.params.questionNumber;
      const { AnswerId, QuestionId } = req.body;

      const activeSession = await Session.findOne({
        where: {
          UserId: +id,
        },
      });

      if (!activeSession) {
        throw { name: "NotFound" };
      }

      const hasAnswered = await UserAnswer.findOne({
        where: {
          QuestionId: +QuestionId,
          ExamId: +activeSession.ExamId,
          UserId: +id,
          questionNumber: +questionNumber,
        },
      });

      if (hasAnswered) {
        const updateAnswer = await UserAnswer.update(
          {
            questionNumber: questionNumber,
            QuestionId: QuestionId,
            AnswerId: AnswerId,
            ExamId: activeSession.ExamId,
            UserId: id,
          },
          {
            where: {
              questionNumber: questionNumber,
            },
          }
        );

        res.status(200).json({
          changedAnswer: updateAnswer,
        });
      } else {
        const userAnswer = await UserAnswer.create({
          questionNumber: questionNumber,
          QuestionId: QuestionId,
          AnswerId: AnswerId,
          ExamId: activeSession.ExamId,
          UserId: id,
        });
        res.status(201).json(userAnswer);
      }
    } catch (err) {
      next(err);
    }
  }

  // show all my previous answers
  static async myAnswer(req, res, next) {
    try {
      const ExamId = +req.params.examId;
      const UserId = +req.user.id;
      const answers = await Answer.findAll({
        where: {
          UserId: UserId,
          ExamId: ExamId,
        },
        include: {
          model: Question,
        },
        order: [["QuestionNumber", "ASC"]],
      });
      res.status(200).json(answers);
    } catch (err) {
      next(err);
    }
  }

  static async myAnswerDetail(req, res, next) {
    try {
      const QuestionNumber = +req.params.questionNumber;
      const UserId = +req.user.id;
      const answers = await Answer.findOne({
        where: {
          UserId: UserId,
          QuestionNumber: QuestionNumber,
        },
        include: {
          model: Question,
        },
      });
      res.status(200).json(answers);
    } catch (err) {
      next(err);
    }
  }
}
module.exports = examController;
