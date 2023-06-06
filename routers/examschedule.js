const express = require("express");
const { isLoggedIn, isAdmin } = require("../middlewares");
const scheduleController = require("../controllers/scheduleController");
const router = express.Router();

router.use(isLoggedIn);

router.post("/", isAdmin, scheduleController.createSchedule);
router.delete("/", isAdmin, scheduleController.deleteSchedule);

module.exports = router;
