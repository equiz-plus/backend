'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Exam extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Exam.hasMany(models.Session, { foreignKey: 'ExamId' })
      Exam.hasMany(models.Grade, { foreignKey: 'ExamId' })
      Exam.hasMany(models.Answer, { foreignKey: 'ExamId' })
    }
  }
  Exam.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Title is required'
        },
        notEmpty: {
          msg: 'Title is required'
        }
      }
    },
    description: DataTypes.TEXT,
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Total questions is required'
        },
        notEmpty: {
          msg: 'Total questions is required'
        }
      }
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Duration is required'
        },
        notEmpty: {
          msg: 'Duration is required'
        }
      }
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Status is required'
        },
        notEmpty: {
          msg: 'Status is required'
        }
      }
    },
    pin: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'PIN is required'
        },
        notEmpty: {
          msg: 'PIN is required'
        }
      }
    },
    isOpen: DataTypes.BOOLEAN,
    closingDate: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Exam',
  });
  return Exam;
};