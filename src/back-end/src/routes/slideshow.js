const express = require("express");
const router = express.Router();
const slideshowController = require("../controllers/SlideshowController");
const authMiddleware = require("../middleware/authMiddleware");
const uploadController = require("../controllers/uploadController");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/active", slideshowController.getActiveSlides);

router.get(
  "/",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  slideshowController.getAllSlides
);
router.get(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  slideshowController.getSlideById
);

router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  upload.single("image"),
  uploadController.uploadImage("image", "slideshows"),
  slideshowController.createSlide
);

router.put(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  upload.single("image"),
  uploadController.uploadImage("image", "slideshows"),
  slideshowController.updateSlide
);

router.delete(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  slideshowController.deleteSlide
);

module.exports = router;
