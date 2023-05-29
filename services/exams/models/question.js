'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Question.hasMany(models.QuestionGroup, { foreignKey: 'QuestionId' })
      Question.hasMany(models.Answer, { foreignKey: 'QuestionId' })
    }
  }
  Question.init({
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Question is required'
        },
        notEmpty: {
          msg: 'Question is required'
        }
      }
    },
    option1: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Options 1 is required'
        },
        notEmpty: {
          msg: 'Options 1 is required'
        }
      }
    },
    option2: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Options 2 is required'
        },
        notEmpty: {
          msg: 'Options 2 is required'
        }
      }
    },
    option3: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Options 3 is required'
        },
        notEmpty: {
          msg: 'Options 3 is required'
        }
      }
    },
    option4: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Options 4 is required'
        },
        notEmpty: {
          msg: 'Options 4 is required'
        }
      }
    },
    answer: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Answer is required'
        },
        notEmpty: {
          msg: 'Answer is required'
        }
      }
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Explanation is required'
        },
        notEmpty: {
          msg: 'Explanation is required'
        }
      }
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'isPremium is required'
        },
        notEmpty: {
          msg: 'isPremium is required'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Question',
  });
  return Question;
};