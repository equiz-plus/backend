'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Grade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Grade.belongsTo(models.User, { foreignKey: 'UserId' })
      Grade.belongsTo(models.Exam, { foreignKey: 'ExamId' })
    }
  }
  Grade.init({
    totalQuestions: DataTypes.INTEGER,
    totalCorrect: DataTypes.INTEGER,
    grade: DataTypes.FLOAT,
    ExamId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Grade',
  });
  return Grade;
};