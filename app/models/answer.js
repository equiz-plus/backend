"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Answer.belongsTo(models.Question, { foreignKey: "QuestionId" });
      Answer.hasMany(models.UserAnswer, { foreignKey: "AnswerId" });
    }
  }
  Answer.init(
    {
      answer: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Answer is required",
          },
          notEmpty: {
            msg: "Answer is required",
          },
        },
      },
      isCorrect: DataTypes.BOOLEAN,
      QuestionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Question ID is required",
          },
          notEmpty: {
            msg: "Question ID is required",
          },
        },
      },
      explanation: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Answer",
    }
  );
  return Answer;
};
