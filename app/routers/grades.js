const express = require("express");
const { isLoggedIn, isAdmin } = require("../middlewares");
const { gradeController } = require("../controllers");
const router = express.Router();

router.use(isLoggedIn);

router.get("/score", gradeController.showMyGrades);
router.get("/score/detail/:GradeId", gradeController.myAnswer);
router.get("/score/:id", isAdmin, gradeController.userGradesById);

module.exports = router;
