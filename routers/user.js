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
// router.post(
//   "/upload",
//   isLoggedIn,
//   uploader.single("file"),
//   userController.uploadFile
// );
router.put("/edit", isLoggedIn, isOwner, userController.userEdit);
router.get("/profile", isLoggedIn, userController.userDetail);
router.get("/detail/:id", isLoggedIn, isAdmin, userController.detail);

// manage user
router.get("/", isLoggedIn, isAdmin, userController.usersList);
router.delete("/:id", isLoggedIn, isAdmin, userController.delete);

module.exports = router;
