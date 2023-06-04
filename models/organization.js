"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Organization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Organization.hasMany(models.Exam, { foreignKey: "id" });
    }
  }
  Organization.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Organization name is required" },
          notEmpty: { msg: "Organization name is required" },
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Organization address is required" },
          notEmpty: { msg: "Organization address is required" },
        },
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Organization logo is required" },
          notEmpty: { msg: "Organization logo is required" },
        },
      },
      pic: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Organization PIC is required" },
          notEmpty: { msg: "Organization PIC is required" },
        },
      },
      sign: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Organization sign is required" },
          notEmpty: { msg: "Organization sign is required" },
        },
      },
    },
    {
      sequelize,
      modelName: "Organization",
    }
  );
  return Organization;
};
