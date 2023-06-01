const { errorHandler } = require("../middlewares/errorHandler");
const { Exam } = require("../models/index");

const deleteExam = async () => {
  try {
    await Exam.destroy({
      restartIdentity: true,
      truncate: true,
      cascade: true,
    });
  } catch (err) {
    errorHandler(err);
  }
};

module.exports = { deleteExam };
