const express = require("express");
const { isAdmin, isLoggedIn } = require("../middlewares");
const categoryController = require("../controllers/categoryController");
const router = express.Router();

router.use(isLoggedIn);
router.use(isAdmin);

router.get("/", categoryController.categoryList);
router.post("/", categoryController.createCategory);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", categoryController.editCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
