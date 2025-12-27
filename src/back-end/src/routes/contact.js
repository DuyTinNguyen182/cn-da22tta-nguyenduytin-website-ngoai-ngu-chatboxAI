const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", contactController.createContact);
router.get(
  "/",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  contactController.getAllContacts
);
router.delete(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  contactController.deleteContact
);
router.patch(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  contactController.updateContactStatus
);

module.exports = router;
