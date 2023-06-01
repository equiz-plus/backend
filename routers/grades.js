const express = require("express");
const { isLoggedIn, isAdmin, isOwner } = require("../middlewares");
const { gradeController } = require("../controllers");
const router = express.Router();

router.use(isLoggedIn);

router.get("/myScore", gradeController.showMyGrades);
router.get("/myScore/Detail", isOwner, gradeController.showMyGradeDetail);
router.get("/score/:id", isOwner, gradeController.userGradesById);

module.exports = router;
