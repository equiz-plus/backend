const express = require("express");
const { isLoggedIn, isAdmin } = require("../middlewares");
const scheduleController = require("../controllers/scheduleController");
const router = express.Router();

router.use(isLoggedIn);

router.post("/", isAdmin, scheduleController.createSchedule);
router.get("/", scheduleController.getSchedule);
router.put("/:id", isAdmin, scheduleController.editSchedule);
router.delete("/:id", isAdmin, scheduleController.deleteSchedule);

module.exports = router;
