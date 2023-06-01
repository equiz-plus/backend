const express = require("express");
const { userController } = require("../controllers");
const { isLoggedIn, isAdmin, isOwner } = require("../middlewares");
const router = express.Router();
const uploader = require("../helpers/multer");
const paymentController = require("../controllers/paymentController");

// payment systems
router.post(
  "/generate-subscription-token",
  isLoggedIn,
  paymentController.generateMitransToken
);
router.patch("/subscription", isLoggedIn, paymentController.subscription);

// profile customization
router.post(
  "/upload",
  isLoggedIn,
  uploader.single("file"),
  userController.uploadFile
);
router.put("/edit", isLoggedIn, userController.userEdit);
router.get("/profile", isLoggedIn, userController.userDetail);
router.get("/detail/:id", isLoggedIn, isOwner, userController.detail);
router.put("/setting/:id", isLoggedIn, isOwner, userController.userEdit);

// manage user
router.get("/", isLoggedIn, userController.usersList);
router.delete("/:id", isLoggedIn, isAdmin, userController.delete);

module.exports = router;
