const express = require("express");
const router = express.Router();
const user = require("./user.js");
const exams = require("./exams.js");
const questions = require("./questions.js");
const grades = require("./grades.js");
const categories = require("./category.js");
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/confirmation", authController.confirmation);

router.use("/users", user);
router.use("/exams", exams);
router.use("/questions", questions);
router.use("/grades", grades);
router.use("/categories", categories);

module.exports = router;
