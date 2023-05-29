'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Answer.belongsTo(models.Question, { foreignKey: 'QuestionId' })
      Answer.belongsTo(models.Exam, { foreignKey: 'ExamId' })
      Answer.belongsTo(models.User, { foreignKey: 'UserId' })
    }
  }
  Answer.init({
    QuestionNumber: DataTypes.INTEGER,
    answer: DataTypes.STRING,
    isCorrect: DataTypes.BOOLEAN,
    QuestionId: DataTypes.INTEGER,
    ExamId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Answer',
  });
  return Answer;
};