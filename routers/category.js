const express = require("express");
const { isAdmin } = require("../middlewares");
const categoryController = require("../controllers/categoryController");
const router = express.Router();

router.use(isAdmin);

router.get("/", categoryController.categoryList);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.editCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
