const express = require("express");
const router = express.Router();
const adminClassController = require("../controllers/adminClassController");
const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/stats",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  adminClassController.getStats
);
router.post(
  "/decision",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  adminClassController.decideClass
);

module.exports = router;
