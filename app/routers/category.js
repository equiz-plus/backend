const express = require("express");
const { isAdmin, isLoggedIn } = require("../middlewares");
const categoryController = require("../controllers/categoryController");
const router = express.Router();

router.use(isLoggedIn);

router.get("/", categoryController.categoryList);
router.post("/", isAdmin, categoryController.createCategory);
router.get("/:id", isAdmin, categoryController.getCategoryById);
router.put("/:id", isAdmin, categoryController.editCategory);
router.delete("/:id", isAdmin, categoryController.deleteCategory);

module.exports = router;
