"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ExamSchedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ExamSchedule.belongsTo(models.Exam, { foreignKey: "ExamId" });
    }
  }
  ExamSchedule.init(
    {
      ExamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "ExamId cannot be empty",
          },
          notEmpty: {
            msg: "ExamId cannot be empty",
          },
        },
      },

      startingDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Starting date cannot be empty",
          },
          notEmpty: {
            msg: "Starting date cannot be empty",
          },
        },
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "End date cannot be empty",
          },
          notEmpty: {
            msg: "End date cannot be empty",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "ExamSchedule",
    }
  );
  return ExamSchedule;
};
