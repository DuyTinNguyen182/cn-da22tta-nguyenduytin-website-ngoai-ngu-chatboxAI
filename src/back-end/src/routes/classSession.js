const express = require("express");
const router = express.Router();
const classSessionController = require("../controllers/classSessionController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", classSessionController.getAllSessions);

router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  classSessionController.createSession
);
router.delete(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  classSessionController.deleteSession
);
router.delete(
  "/multiple",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  classSessionController.deleteMultipleSessions
);

module.exports = router;
