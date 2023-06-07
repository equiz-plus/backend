const express = require("express");
const { isLoggedIn, isAdmin } = require("../middlewares");
const { examController } = require("../controllers");
const userExamController = require("../controllers/examUserController");
const router = express.Router();

router.use(isLoggedIn);

router.get("/", examController.examLists);
router.post("/", isAdmin, examController.create);
router.patch(
  "/change-visibility/:id",
  isAdmin,
  examController.changeVisibility
);

router.get("/session", userExamController.getSession);
router.post("/end", userExamController.endExam);
router.get("/detail/:ExamId", userExamController.examDetail);

router.post("/start/:ExamId", userExamController.start);
router.post("/answer/:questionNumber", userExamController.answer);

router.get("/:id", isAdmin, examController.examDetail);
router.put("/:id", isAdmin, examController.edit);
router.delete("/:id", isAdmin, examController.delete);

module.exports = router;
