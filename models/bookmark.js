"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Bookmark extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bookmark.belongsTo(models.User, { foreignKey: "UserId" });
      Bookmark.belongsTo(models.Exam, { foreignKey: "ExamId" });
    }
  }
  Bookmark.init(
    {
      UserId: DataTypes.INTEGER,
      ExamId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Bookmark",
    }
  );
  return Bookmark;
};
