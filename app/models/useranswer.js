"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserAnswer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserAnswer.belongsTo(models.Question, { foreignKey: "QuestionId" });
      UserAnswer.belongsTo(models.Answer, { foreignKey: "AnswerId" });
      UserAnswer.belongsTo(models.Exam, { foreignKey: "ExamId" });
      UserAnswer.belongsTo(models.User, { foreignKey: "UserId" });
    }
  }
  UserAnswer.init(
    {
      questionNumber: DataTypes.INTEGER,
      QuestionId: DataTypes.INTEGER,
      AnswerId: DataTypes.INTEGER,
      ExamId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserAnswer",
    }
  );
  return UserAnswer;
};
