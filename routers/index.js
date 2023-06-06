const express = require("express");
const router = express.Router();
const user = require("./user.js");
const exams = require("./exams.js");
const questions = require("./questions.js");
const grades = require("./grades.js");
const categories = require("./category.js");
const organizations = require("./organizations.js");
const certificates = require("./certificates.js");
const payment = require("./payment.js");
const authController = require("../controllers/authController");
const examSchedule = require("./examschedule.js");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/confirmation", authController.confirmation);

router.use("/users", user);
router.use("/exams", exams);
router.use("/questions", questions);
router.use("/grades", grades);
router.use("/categories", categories);
router.use("/organizations", organizations);
router.use("/certificates", certificates);
router.use("/payment", payment);
router.use("/schedules", examSchedule);

module.exports = router;
