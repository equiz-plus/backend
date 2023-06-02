const express = require("express");
const { isLoggedIn, isAdmin, isOwner } = require("../middlewares");
const { gradeController } = require("../controllers");
const router = express.Router();

router.use(isLoggedIn);

router.get("/score", gradeController.showMyGrades);
router.get("/score/detail", isOwner, gradeController.showMyGradeDetail);
router.get("/score/:id", isOwner, gradeController.userGradesById);

module.exports = router;
