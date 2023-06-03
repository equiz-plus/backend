const { Op, Sequelize, or } = require("sequelize");
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
} = require("../models");

// list of exams
// !!convert to pagination version
// *admin
class examController {
  static async examLists(req, res, next) {
    try {
      const { page, CategoryId, displayLength, sort, order, search } =
        req.query;

      let whereCondition = {};

      // set query length
      let pagination = +displayLength;
      if (!displayLength || isNaN(displayLength)) {
        pagination = 25;
      }

      // set search
      if (search) {
        whereCondition.title = {
          [Op.iLike]: `%${search}%`,
        };
      }

      // set sort
      let sortBy = sort;
      let sortOrder = order;

      if (!sortBy || sortBy !== "name") {
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

      console.log(autoSort, "INI SORTINGAN");

      // check if CategoryId input is correct
      if (!CategoryId || isNaN(CategoryId)) {
        whereCondition = {};
      } else {
        whereCondition.CategoryId = +CategoryId;
      }

      console.log(whereCondition, "INI WHERE FINAL");

      // check if page number could be out of range
      const examCount = await Exam.count({
        where: whereCondition,
      });

      console.log(examCount, "INI TOTAL EXAM YANG DITEMUKAN");
      console.log(page, "INI PAGE SEBELUM CORRECTION");

      // page number correction
      const totalPages = Math.ceil(examCount / pagination);
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
      const exams = await Exam.findAndCountAll({
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

  // begin EXAM
  // *user
  static async start(req, res, next) {
    const generateExamTransaction = await sequelize.transaction();
    try {
      const { id } = req.user;
      const { ExamId } = req.params;

      // check first if user is already in exam
      const activeSession = await Session.findAll({
        attributes: ["id"],
        where: { UserId: +id },
      });

      if (activeSession.length !== 0) {
        throw { name: "InExam" };
      }

      // check if exam exists
      const exam = await Exam.findByPk(+ExamId);

      if (!exam) throw { name: "NotFound" };
      if (!exam.isOpen) throw { name: "ExamClose" };

      // ensure student never attends exam
      const gradeExist = await Grade.findOne({
        attributes: ["id"],
        where: {
          ExamId,
          UserId: +id,
        },
      });

      if (gradeExist) throw { name: "ExamTaken" };

      // if never take, create new grade entry
      const newGrade = await Grade.create(
        {
          questionsCount: exam.totalQuestions,
          totalCorrect: 0,
          grade: 0,
          ExamId,
          UserId: +id,
        },
        {
          transaction: generateExamTransaction,
        }
      );

      // generate exam ending time
      let timeStop = new Date().getTime() + exam.duration * 60000;
      timeStop = new Date(timeStop);

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

      if (randomQuestions.length <= 0) {
        throw { name: "NoQuestion" };
      }

      // create exam session
      const session = await Session.create(
        {
          timeStop,
          ExamId,
          UserId: +id,
        },
        {
          transaction: generateExamTransaction,
        }
      );

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

  // get back on current exam session, in case of power failure
  // *user
  static async getSession(req, res, next) {
    try {
      const { id } = req.user;
      const activeSession = await Session.findOne({
        where: {
          UserId: +id,
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
            include: [
              {
                model: UserAnswer,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
            ],
          },
          {
            model: QuestionGroup,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: [
              {
                model: Question,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
                include: [
                  {
                    model: Answer,
                    attributes: {
                      exclude: [
                        "createdAt",
                        "updatedAt",
                        "isCorrect",
                        "explanation",
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      if (activeSession) {
        // has the session expired yet?
        const now = new Date();

        if (activeSession.timeStop < now) {
          await Session.destroy({
            where: {
              UserId: +id,
            },
          });

          const userGrade = await Grade.findOne({
            attributes: ["id", "questionsCount", "totalCorrect"],
            where: {
              UserId: +activeSession.UserId,
              ExamId: +activeSession.ExamId,
            },
          });

          const resultScore = Math.round(
            (userGrade.totalCorrect / userGrade.questionsCount) * 100
          );

          const finalScore = await Grade.update(
            {
              grade: Math.round(resultScore),
            },
            {
              where: {
                UserId: +activeSession.UserId,
                ExamId: +activeSession.ExamId,
              },
            }
          );

          throw { name: "TimeOver" };
        }
      } else {
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

      // check if user is in an active session
      const activeSession = await Session.findOne({
        attributes: ["id", "ExamId", "UserId", "timeStop"],
        where: {
          UserId: +id,
        },
      });

      if (activeSession) {
        // has the session expired yet?
        const now = new Date();

        if (activeSession.timeStop < now) {
          await Session.destroy({
            where: {
              UserId: +id,
            },
          });
          throw { name: "TimeOver" };
        }
      } else {
        throw { name: "NotFound" };
      }

      // check if QuestionGroups exists on that path
      const question = await QuestionGroup.findOne({
        attributes: ["id"],
        where: {
          questionNumber,
          QuestionId,
          SessionId: +activeSession.id,
        },
      });

      if (!question) {
        throw { name: "NotFound" };
      }

      // check if answer bank has answers exist for that question
      const answer = await Answer.findOne({
        attributes: ["id"],
        where: {
          QuestionId,
          id: +AnswerId,
        },
      });

      if (!answer) throw { name: "NotFound" };

      // check the correct answer for this question
      const correctAnswer = await Answer.findOne({
        attributes: ["id"],
        where: {
          QuestionId,
          isCorrect: true,
        },
      });

      // check if user has answered this specific question
      const findUserAnswer = await UserAnswer.findOne({
        attributes: ["AnswerId"],
        where: {
          questionNumber,
          QuestionId,
          ExamId: +activeSession.ExamId,
          UserId: +activeSession.UserId,
        },
      });

      // if user hasn't answer this specific question
      if (!findUserAnswer) {
        // then create new user answer entry
        const userAnswer = await UserAnswer.create({
          questionNumber: +questionNumber,
          QuestionId: +QuestionId,
          AnswerId: +AnswerId,
          ExamId: +activeSession.ExamId,
          UserId: +id,
        });

        // compare correct answer id with user answer id
        if (+userAnswer.AnswerId === +correctAnswer.id) {
          await Grade.increment(
            {
              totalCorrect: 1,
            },
            {
              where: {
                UserId: +id,
                ExamId: +activeSession.ExamId,
              },
            }
          );
        }

        res.status(201).json(userAnswer);
      } else {
        // check if previous answer is correct
        if (+findUserAnswer.AnswerId === correctAnswer.id) {
          await Grade.decrement(
            {
              totalCorrect: 1,
            },
            {
              where: {
                UserId: +id,
                ExamId: +activeSession.ExamId,
              },
            }
          );
        }

        // then update the existing answer
        const updateAnswer = await UserAnswer.update(
          {
            questionNumber: +questionNumber,
            QuestionId: +QuestionId,
            AnswerId: +AnswerId,
            ExamId: +activeSession.ExamId,
            UserId: +id,
          },
          {
            where: {
              questionNumber: +questionNumber,
            },
          }
        );

        // finally check the new answer
        if (+AnswerId === correctAnswer.id) {
          await Grade.increment(
            {
              totalCorrect: 1,
            },
            {
              where: {
                UserId: +id,
                ExamId: +activeSession.ExamId,
              },
            }
          );
        }

        res.status(200).json({
          changedAnswer: updateAnswer,
        });
      }
    } catch (err) {
      next(err);
    }
  }

  // show all my previous answers
  // *user
  static async myAnswer(req, res, next) {
    try {
      const { ExamId } = req.params;
      const { id } = req.user;
      const { page, displayLength } = req.query;

      //pagination
      let pagination = +displayLength;
      if (!pagination || isNaN(pagination)) {
        pagination = 25;
      }

      // check if page number could be out of range
      const answerCount = await UserAnswer.count({
        where: {
          UserId: +id,
          ExamId: +ExamId,
        },
      });

      const totalPages = Math.ceil(answerCount / pagination);

      // page number correction
      let autoPage = 1;
      if (page > answerCount / pagination) {
        autoPage = answerCount / pagination;
      } else if (page < 1 || isNaN(page)) {
        autoPage = 1;
      } else {
        autoPage = page;
      }

      const myAnswer = await UserAnswer.findAndCountAll({
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        where: {
          UserId: +id,
          ExamId: +ExamId,
        },
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
        order: [["questionNumber", "ASC"]],
        offset: (+autoPage - 1) * pagination || 0,
        limit: pagination,
      });

      if (myAnswer.length <= 0) {
        throw { name: "NotFound" };
      }

      res.status(200).json({
        currentPage: autoPage,
        totalPages: totalPages,
        totalRows: myAnswer.count,
        answers: myAnswer.rows,
      });
    } catch (err) {
      next(err);
    }
  }
}
module.exports = examController;
