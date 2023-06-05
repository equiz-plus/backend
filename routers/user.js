const express = require("express");
const { userController } = require("../controllers");
const { isLoggedIn, isAdmin, isOwner } = require("../middlewares");
const router = express.Router();
const uploader = require("../helpers/multer");

// profile customization
// router.post(
//   "/upload",
//   isLoggedIn,
//   uploader.single("file"),
//   userController.uploadFile
// );
router.put("/edit", isLoggedIn, isOwner, userController.userEdit);
router.get("/profile", isLoggedIn, userController.userDetail);

// manage user
router.get("/detail/:id", isLoggedIn, isAdmin, userController.detail);
router.get("/", isLoggedIn, isAdmin, userController.usersList);
router.delete("/:id", isLoggedIn, isAdmin, userController.delete);

module.exports = router;
