const {
  comparePassword,
  encrypt,
  usernameGenerator,
  tokenKey,
} = require("../helpers");
const { User } = require("../models");
const sendEmailConfirmation = require("../helpers/sendEmailConfirmation");

class authController {
  //static for register
  // *users
  static async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      const createdUser = await User.create({
        email,
        password,
        name,
        username: usernameGenerator(email),
        role: "guest",
        isPremium: false,
        tokenKey: tokenKey(),
        avatar:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
      });

      sendEmailConfirmation(createdUser.email, createdUser.tokenKey);

      res.status(201).json({
        email: email,
        message: "User was registered successfully! Please check your email",
      });
    } catch (err) {
      next(err);
    }
  }

  // user confirm by email
  // *users
  static async confirmation(req, res, next) {
    try {
      let tokenKey;
      let email;

      if (req.body.token) {
        tokenKey = req.body.token;
        email = req.body.email;
      } else {
        throw { name: "TokenRequired" };
      }

      const isValidToken = await User.update(
        {
          role: "user",
          tokenKey: null,
        },
        {
          where: {
            tokenKey: tokenKey,
            email: email,
          },
        }
      );

      if (isValidToken <= 0) throw { name: "InvalidVerificationInfo" };

      res.status(200).json({
        email: email,
        message: "Your account has been activated",
      });
    } catch (err) {
      next(err);
    }
  }

  //status for login
  // *users
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };
      const user = await User.findOne({
        where: {
          email,
        },
      });
      if (!user) throw { name: "Unauthorized" };
      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) throw { name: "Unauthorized" };
      if (user.role === "guest") throw { name: "isNotComfirm" };

      // check user premium status
      const now = new Date();

      let premiumStatus = user.isPremium;

      if (!user.premiumExpiry || user.premiumExpiry < now) {
        const removePremium = await User.update(
          {
            isPremium: false,
          },
          {
            where: {
              id: +user.id,
            },
          }
        );
        premiumStatus = false;
      } else {
        premiumStatus = true;
      }

      const access_token = encrypt({
        id: user.id,
        username: user.username,
        role: user.role,
        isPremium: premiumStatus,
      });
      res.status(200).json({
        access_token,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        isPremium: premiumStatus,
        id: user.id,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = authController;
