const { errorHandler } = require("../middlewares/errorHandler");
const { User, Grade, Session, Exam } = require("../models/index");

const deleteUser = async () => {
  await User.destroy({
    restartIdentity: true,
    truncate: true,
    cascade: true,
  });
};

const updateToken = async () => {
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
};

const findToken = async () => {
  const user = await User.findByPk(1);
  return user;
};

const setScore = async () => {
  const grade = await Grade.update(
    {
      totalCorrect: 1,
    },
    {
      where: {
        id: 1,
      },
    }
  );
  console.log(grade, "INI GRADE DAH KEUPDATE");

  const oldDate = new Date("2022-03-25");

  const session = await Session.update(
    {
      timeStop: oldDate,
    },
    {
      where: {
        id: 2,
      },
    }
  );
  console.log(session, "INI SESSION DAH KEUPDATE");

  return;
};

const mockUser = async () => {
  const addUser = await User.create({
    email: "john@test.com",
    password: "12345678",
    username: "john",
    phone: "080989999",
    name: "satrio",
    gender: "male",
    role: "user",
    isPremium: false,
    tokenKey: "ZOZA",
  });

  return addUser;
};

module.exports = { deleteUser, updateToken, findToken, setScore, mockUser };
