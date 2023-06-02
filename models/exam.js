"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Exam extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Exam.hasMany(models.Session, { foreignKey: "ExamId" });
      Exam.hasMany(models.Grade, { foreignKey: "ExamId" });
      Exam.hasMany(models.UserAnswer, { foreignKey: "ExamId" });
      Exam.hasMany(models.Bookmark, { foreignKey: "ExamId" });
      Exam.belongsTo(models.Category, { foreignKey: "CategoryId" });
    }
  }
  Exam.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Title is required",
          },
          notEmpty: {
            msg: "Title is required",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Description is required",
          },
          notEmpty: {
            msg: "Description is required",
          },
        },
      },
      totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Total questions is required",
          },
          notEmpty: {
            msg: "Total questions is required",
          },
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Duration is required",
          },
          notEmpty: {
            msg: "Duration is required",
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
      isOpen: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Exam",
    }
  );
  return Exam;
};
