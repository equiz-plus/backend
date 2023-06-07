const express = require("express");
const { isAdmin, isLoggedIn } = require("../middlewares");
const organizationController = require("../controllers/organizationController");

const router = express.Router();

router.use(isLoggedIn);
router.use(isAdmin);

router.get("/", organizationController.organizationList);
router.post("/", organizationController.createOrganization);
router.get("/:id", organizationController.organizationDetail);
router.put("/:id", organizationController.organizationEdit);
router.delete("/:id", organizationController.organizationDelete);

module.exports = router;
