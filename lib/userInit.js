const { errorHandler } = require("../middlewares/errorHandler");
const { User } = require("../models/index");

// const createUser = async () => {
//   try {
//     await User.create({
//       name: "student",
//       email: "student@test10.com",
//       password: "12345678",
//     });
//   } catch (err) {
//     errorHandler(err);
//   }
// };

const deleteUser = async () => {
  try {
    await User.destroy({
      restartIdentity: true,
      truncate: true,
      cascade: true,
    });
  } catch (err) {
    errorHandler(err);
  }
};

const updateToken = async () => {
  try {
    await User.update(
      {
        role: "admin",
      },
      {
        where: {
          id: 1,
        },
      }
    );
  } catch (err) {
    errorHandler(err);
  }
};

module.exports = { deleteUser, updateToken };
