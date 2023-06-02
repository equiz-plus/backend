"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Question.hasMany(models.QuestionGroup, { foreignKey: "QuestionId" });
      Question.hasMany(models.Answer, { foreignKey: "QuestionId" });
      Question.hasMany(models.UserAnswer, { foreignKey: "QuestionId" });
      Question.belongsTo(models.Category, { foreignKey: "CategoryId" });
    }
  }
  Question.init(
    {
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Question is required",
          },
          notEmpty: {
            msg: "Question is required",
          },
        },
      },
      CategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Category ID is required",
          },
          notEmpty: {
            msg: "Category ID is required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Question",
    }
  );
  return Question;
};
