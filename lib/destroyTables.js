const { errorHandler } = require("../middlewares/errorHandler");
const {
  Category,
  Exam,
  Grade,
  UserAnswer,
  Certificate,
  Organization,
  ExamSchedule,
} = require("../models/index");

const deleteCategory = async () => {
  await Category.destroy({
    restartIdentity: true,
    truncate: true,
    cascade: true,
  });
};

const deleteExam = async () => {
  await Exam.destroy({
    restartIdentity: true,
    truncate: true,
    cascade: true,
  });
};

const deleteGrade = async () => {
  await Grade.destroy({
    restartIdentity: true,
    truncate: true,
    cascade: true,
  });
};

const deleteUserAnswer = async () => {
  await UserAnswer.destroy({
    restartIdentity: true,
    truncate: true,
    cascade: true,
  });
};

const deleteCertificate = async () => {
  await Certificate.destroy({
    restartIdentity: true,
    truncate: true,
    cascade: true,
  });
};

const deleteOrganizations = async () => {
  await Organization.destroy({
    restartIdentity: true,
    truncate: true,
    cascade: true,
  });
};

const deleteSchedule = async () => {
  await ExamSchedule.destroy({
    restartIdentity: true,
    truncate: true,
    cascade: true,
  });
};

module.exports = {
  deleteCategory,
  deleteExam,
  deleteGrade,
  deleteUserAnswer,
  deleteCertificate,
  deleteOrganizations,
  deleteSchedule,
};
