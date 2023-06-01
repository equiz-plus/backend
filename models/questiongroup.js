'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuestionGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      QuestionGroup.belongsTo(models.Question, { foreignKey: 'QuestionId' })
      QuestionGroup.belongsTo(models.Session, { foreignKey: 'SessionId' })
      QuestionGroup.belongsTo(models.User, { foreignKey: 'UserId' })
    }
  }
  QuestionGroup.init({
    questionNumber: DataTypes.INTEGER,
    QuestionId: DataTypes.INTEGER,
    SessionId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'QuestionGroup',
  });
  return QuestionGroup;
};