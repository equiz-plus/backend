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
  User,
} = require("../models");

class userExamController {
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

      // check if user is a premium
      const user = await User.findOne({
        include: {
          model: Grade,
        },
        where: {
          id: +id,
        },
      });

      if (user.isPremium === false && user.Grades.length >= 10) {
        throw { name: "NotPremium" };
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

      // TODO: CHECK IF THIS IS REALLY RANDOM !
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

      // if never take, create new grade entry
      const newGrade = await Grade.create(
        {
          questionsCount: randomQuestions.length,
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

      // prepare unique questions order for user
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

      // TODO: CHECK questionGroups IF THIS IS REALLY RANDOM !

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
      const passingGrade = 70;
      let status = "Failed";

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
        order: [[QuestionGroup, "questionNumber", "ASC"]],
      });

      if (activeSession) {
        // has the session expired yet?
        const now = new Date();

        if (activeSession.timeStop < now) {
          // execute ending session
          await Session.destroy({
            where: {
              UserId: +id,
            },
          });

          // calculate use score immediately
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

          // print certificate
          if (resultScore >= passingGrade) {
            // find organization
            let organizationPrefix = "EQZ";

            const organization = await Organization.findOne({
              where: {
                id: +activeSession.Exam.OrganizationId,
              },
            });

            // does organization exist?
            if (organization) {
              if (organization.prefix) {
                organizationPrefix = organization.prefix;
              }
            }

            let QRcode = "QRCODE";

            // create new certificate
            const newCertificate = await Certificate.create({
              publishedDate: new Date(),
              UserId: +id,
              ExamId: +activeSession.Exam.id,
              GradeId: +userGrade.id,
              QRcode: QRcode,
            });

            let certId = newCertificate.id.toString();
            let month = newCertificate.publishedDate
              .toISOString()
              .substring(5, 7);
            let year = newCertificate.publishedDate
              .toISOString()
              .substring(0, 4);

            let certNumber = "";
            for (let i = 1; i <= 4 - certId.length; i++) {
              certNumber += "0";
            }
            certNumber += certId;

            const certNo = `CERT/${certNumber}/${organizationPrefix}/${month}/${year}`;
            const slug = certNo.split("/").join("-");

            const updateNo = await Certificate.update(
              {
                certificateNo: certNo,
                slug: slug,
                QRcode: `${process.env.BASE_URL}/certificates/${slug}`,
              },
              {
                where: {
                  id: +certId,
                },
              }
            );
            // change message to passed
            status = "Passed";
          }

          res.status(200).json({
            message: "Exam has ended",
            status: status,
          });
        } else {
          res.status(200).json(activeSession);
        }
      } else {
        throw { name: "NotFound" };
      }
    } catch (err) {
      next(err);
    }
  }

  // user wanted to end the exam early
  // *user
  static async endExam(req, res, next) {
    const endExamTransaction = await sequelize.transaction();
    try {
      const passingGrade = 70;
      let status = "Failed";

      const { id } = req.user;

      // check first if user is already in exam
      const activeSession = await Session.findOne({
        include: [
          {
            model: Exam,
          },
        ],
        where: { UserId: +id },
      });

      if (!activeSession) {
        throw { name: "NotFound" };
      } else {
        // calculate user score immediately
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

        // update score
        const finalScore = await Grade.update(
          {
            grade: Math.round(resultScore),
          },
          {
            where: {
              UserId: +activeSession.UserId,
              ExamId: +activeSession.ExamId,
            },
          },
          { transaction: endExamTransaction }
        );

        // print certificate
        if (resultScore >= passingGrade) {
          // find organization
          let organizationPrefix = "EQZ";

          // does organization exist?
          if (activeSession.Exam.OrganizationId) {
            const organization = await Organization.findOne({
              where: {
                id: +activeSession.Exam.OrganizationId,
              },
            });

            if (organization) {
              if (organization.prefix) {
                organizationPrefix = organization.prefix;
              }
            }
          }

          let QRcode = "QRCODE";

          // create new certificate
          const newCertificate = await Certificate.create({
            publishedDate: new Date(),
            UserId: +id,
            ExamId: +activeSession.Exam.id,
            GradeId: +userGrade.id,
            QRcode: QRcode,
          });

          let certId = newCertificate.id.toString();
          let month = newCertificate.publishedDate
            .toISOString()
            .substring(5, 7);
          let year = newCertificate.publishedDate.toISOString().substring(0, 4);

          let certNumber = "";
          for (let i = 1; i <= 4 - certId.length; i++) {
            certNumber += "0";
          }
          certNumber += certId;

          const certNo = `CERT/${certNumber}/${organizationPrefix}/${month}/${year}`;
          const slug = certNo.split("/").join("-");

          const updateNo = await Certificate.update(
            {
              certificateNo: certNo,
              slug: slug,
              QRcode: `${process.env.BASE_URL}/certificates/${slug}`,
            },
            {
              where: {
                id: +certId,
              },
            }
          );

          if (updateNo <= 0) {
            throw { name: "NothingUpdate" };
          }
          // change message to passed
          status = "Passed";
        }

        // execute ending session
        const destroyedSession = await Session.destroy(
          {
            where: {
              id: +activeSession.id,
            },
          },
          { transaction: endExamTransaction }
        );
      }

      await endExamTransaction.commit();

      res.status(200).json({
        message: `User ${id} current exam has ended`,
        status: status,
      });
    } catch (err) {
      await endExamTransaction.rollback();
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
          console.log("ACTIVE SESSION EXPIRED<<<<<<<<<<<<<<<<<<<<<<<<<");
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
          message: `Answer changed to ${AnswerId}`,
        });
      }
    } catch (err) {
      next(err);
    }
  }

  // exam disclaimer before start
  // *user
  static async examDetail(req, res, next) {
    try {
      const { ExamId } = req.params;
      const { id } = req.user;

      const exams = await Exam.findOne({
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        include: [
          {
            model: Grade,
            attributes: ["id", "UserId", "ExamId"],
            where: {
              UserId: +id,
            },
            required: false,
          },
          {
            model: Session,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            required: false,
          },
          {
            model: Category,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        ],
        where: { id: ExamId },
      });

      if (!exams) throw { name: "NotFound" };

      res.status(200).json(exams);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = userExamController;
