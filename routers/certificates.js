const express = require("express");
const { isAdmin, isLoggedIn } = require("../middlewares");
const certificateController = require("../controllers/certificateController");

const router = express.Router();

router.get("/", isLoggedIn, isAdmin, certificateController.certificateList);
router.get("/:slug", certificateController.certificateDetail);

module.exports = router;
