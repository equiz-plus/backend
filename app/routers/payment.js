const express = require("express");
const { isAdmin, isLoggedIn } = require("../middlewares");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.post("/pay", isLoggedIn, paymentController.generateMidtransToken);
router.post("/checking", paymentController.paymentNotification);

module.exports = router;
