'use strict';
const {
  Model
} = require('sequelize');
const { hashPassword } = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Session, { foreignKey: 'UserId' })
      User.hasMany(models.Answer, { foreignKey: 'UserId' })
      User.hasMany(models.Grade, { foreignKey: 'UserId' })
      User.hasMany(models.QuestionGroup, { foreignKey: 'UserId' })
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Username is required'
        },
        notEmpty: {
          msg: 'Username is required'
        }
      },
      unique: {
        msg: 'Username has been taken'
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Email is required'
        },
        notEmpty: {
          msg: 'Email is required'
        },
        isEmail: {
          msg: 'Invalid email format'
        }
      },
      unique: {
        msg: 'Email has been taken'
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password is required'
        },
        notEmpty: {
          msg: 'Password is required'
        },
        len: {
          args: [8],
          msg: 'Password at least 8 characters'
        }
      }
    },
    phone: DataTypes.STRING,
    name: DataTypes.STRING,
    gender: DataTypes.STRING,
    avatar: DataTypes.STRING,
    role: DataTypes.STRING,
    isPremium: DataTypes.BOOLEAN,
    tokenKey: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  User.beforeCreate(user => {
    user.password = hashPassword(user.password)
  })
  return User;
};