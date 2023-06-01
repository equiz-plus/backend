const { comparePassword } = require("../helpers");
const { Op } = require("sequelize");
const { User } = require("../models");
const cloudinary = require("../helpers/cloudinary");

class userController {
  // get all users data
  // *admin
  static async usersList(req, res, next) {
    try {
      const { search } = req.query;

      let whereCondition = {};
      if (search) {
        whereCondition = {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        };
      }

      const { count, rows } = await User.findAndCountAll({
        where: whereCondition,
        attributes: {
          exclude: ["password"],
        },
      });
      if (search && count <= 0) throw { name: "NotFound" };

      res.status(200).json({
        count,
        users: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  // get detail user
  // *admin
  static async detail(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findOne({
        where: {
          id,
        },
        attributes: {
          exclude: ["password"],
        },
      });
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  // delete user
  // *admin
  static async delete(req, res, next) {
    try {
      const id = +req.params.id;
      const user = await User.destroy({
        where: {
          id,
        },
      });

      if (user <= 0) throw { name: "NotFound" };

      res.status(200).json({
        message: `User with id ${id} has been deleted`,
      });
    } catch (err) {
      next(err);
    }
  }

  // method to get detail user
  // *user
  static async userDetail(req, res, next) {
    try {
      const { id } = req.user;
      const user = await User.findOne({
        where: {
          id,
        },
        attributes: {
          exclude: ["tokenKey", "password"],
        },
      });
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  // method for edit data user
  // *user
  static async userEdit(req, res, next) {
    try {
      const { id } = req.user;
      const {
        username,
        email,
        password,
        oldPassword,
        phone,
        name,
        gender,
        avatar,
      } = req.body;

      if (
        !username &&
        !email &&
        !password &&
        !oldPassword &&
        !phone &&
        !name &&
        !gender
      )
        throw { name: "NothingUpdate" };
      if (password) {
        if (!oldPassword) throw { name: "OldPasswordRequired" };
        const cekPassword = await User.findByPk(id);
        const isMatchPassword = comparePassword(
          oldPassword,
          cekPassword.password
        );
        if (!isMatchPassword) throw { name: "InvalidOldPassword" };
      }

      const user = await User.update(
        {
          username,
          email,
          password,
          phone,
          name,
          gender,
          avatar,
        },
        {
          where: {
            id,
          },
          individualHooks: true,
        }
      );

      res.status(200).json({
        message: "User data has been updated",
      });
    } catch (err) {
      next(err);
    }
  }

  // user upload profile photo
  // *user
  static async uploadFile(req, res, next) {
    try {
      const { id } = req.user;
      if (!req.file) throw { name: "FileRequired" };
      const { path } = req.file;

      const upload = await cloudinary.uploader.upload(path, {
        folder: "user-avatar",
        width: 200,
        height: 200,
        Crop: "fill",
      });

      console.log(upload);

      const user = await User.update(
        // { avatar: upload },
        { where: { id } }
      );
      if (user <= 0) throw { name: "UploadFailed" };

      return res.status(201).json({
        message: "Avatar has been updated",
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = userController;
