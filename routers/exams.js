const express = require("express");
const { isLoggedIn, isAdmin, isOwner } = require("../middlewares");
const { examController } = require("../controllers");
const router = express.Router();

router.use(isLoggedIn);

router.get("/", isAdmin, examController.examLists);
router.post("/", isAdmin, examController.create);
router.patch(
  "/change-visibility/:id",
  isAdmin,
  examController.changeVisibility
);

router.get("/list", examController.examListsUser);
router.get("/session", examController.getSession);
router.post("/end", examController.endExam);
router.get("/detail/:id", examController.examDetail);

router.post("/start/:ExamId", examController.start);
router.post("/answer/:questionNumber", examController.answer);
router.get("/my-answer/:ExamId", examController.myAnswer);

router.put("/:id", isAdmin, examController.edit);
router.delete("/:id", isAdmin, examController.delete);

module.exports = router;
