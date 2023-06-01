const express = require("express");
const { isLoggedIn, isAdmin, isOwner } = require("../middlewares");
const { examController } = require("../controllers");
const router = express.Router();

router.use(isLoggedIn);

router.get("/", isAdmin, examController.examLists);
router.post("/", isAdmin, examController.create);
router.put("/:id", isAdmin, examController.edit);
router.delete("/:id", isAdmin, examController.delete);

router.get("/session", examController.getSession);
router.get("/question", examController.getQuestion);
router.get("/detail/:id", examController.detailForUser);
router.patch(
  "/change-visibility/:id",
  isAdmin,
  examController.changeVisibility
);
router.post("/start/:id", examController.start);
router.post("/answer/:questionNumber", examController.answer);
router.get("/my-answer/:examId", examController.myAnswer);
router.get("/my-answer/detail/:questionNumber", examController.myAnswerDetail);

module.exports = router;
