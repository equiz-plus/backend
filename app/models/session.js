'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Session.belongsTo(models.User, { foreignKey: 'UserId' })
      Session.belongsTo(models.Exam, { foreignKey: 'ExamId' })
      Session.hasMany(models.QuestionGroup, { foreignKey: 'SessionId' })
    }
  }
  Session.init({
    timeStop: DataTypes.DATE,
    ExamId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Session',
  });
  return Session;
};