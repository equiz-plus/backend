const express = require("express");
const { isAdmin, isLoggedIn } = require("../middlewares");
const certificateController = require("../controllers/certificateController");

const router = express.Router();

router.use(isLoggedIn);
router.use(isAdmin);

router.get("/", certificateController.certificateList);
router.post("/", certificateController.createCertificate);
router.get("/:id", certificateController.certificateDetail);
router.put("/:id", certificateController.certificateEdit);
router.delete("/:id", certificateController.certificateDelete);

module.exports = router;
