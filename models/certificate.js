"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Certificate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Certificate.belongsTo(models.Exam, { foreignKey: "ExamId" });
      Certificate.belongsTo(models.User, { foreignKey: "UserId" });
      Certificate.belongsTo(models.Grade, { foreignKey: "GradeId" });
    }
  }
  Certificate.init(
    {
      publishedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Published date cannot be empty",
          },
          notEmpty: {
            msg: "Published date cannot be empty",
          },
        },
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "User ID cannot be empty",
          },
          notEmpty: {
            msg: "User ID cannot be empty",
          },
        },
      },
      ExamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Exam ID cannot be empty",
          },
          notEmpty: {
            msg: "Exam ID cannot be empty",
          },
        },
      },
      GradeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Grade ID cannot be empty",
          },
          notEmpty: {
            msg: "Grade ID cannot be empty",
          },
        },
      },
      QRcode: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "QR code cannot be empty",
          },
          notEmpty: {
            msg: "QR code cannot be empty",
          },
        },
      },
      slug: {
        type: DataTypes.STRING,
      },
      certificateNo: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Certificate",
    }
  );
  return Certificate;
};
