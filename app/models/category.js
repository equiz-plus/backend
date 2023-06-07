"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Category.hasMany(models.Question, { foreignKey: "CategoryId" });
      Category.hasMany(models.Exam, { foreignKey: "CategoryId" });
    }
  }
  Category.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Category name is required",
          },
          notEmpty: {
            msg: "Category name is required",
          },
        },
        unique: {
          msg: "This category already exist",
        },
      },
    },
    {
      sequelize,
      modelName: "Category",
    }
  );
  return Category;
};
