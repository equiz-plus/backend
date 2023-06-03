const express = require("express");
const { isLoggedIn, isAdmin } = require("../middlewares");
const { questionController } = require("../controllers");
const router = express.Router();

router.use(isLoggedIn);
router.use(isAdmin);

router.get("/", questionController.index);
router.post("/", questionController.create);
router.delete("/:id", questionController.delete);

module.exports = router;
