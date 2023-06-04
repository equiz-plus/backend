const { errorHandler } = require("../middlewares/errorHandler");
const { Category } = require("../models/index");

const deleteCategory = async () => {
  try {
    await Category.destroy({
      restartIdentity: true,
      truncate: true,
      cascade: true,
    });
  } catch (err) {
    errorHandler(err);
  }
};

module.exports = { deleteCategory };
