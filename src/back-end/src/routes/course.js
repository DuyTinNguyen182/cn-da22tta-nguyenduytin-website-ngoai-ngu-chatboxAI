const express = require("express");
const router = express.Router();
const courseController = require("../controllers/CourseController");
const authMiddleware = require("../middleware/authMiddleware");
const uploadController = require("../controllers/uploadController");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.patch("/:id/view", courseController.incrementCourseViews);
// router.post('/', authMiddleware.authenticate, authMiddleware.isAdmin, courseController.createCourse);
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  upload.single("image"),
  uploadController.uploadImage("image", "courses"),
  courseController.createCourse
);
// router.put('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, courseController.updateCourse);
router.put(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  upload.single("image"),
  uploadController.uploadImage("image", "courses"),
  courseController.updateCourse
);
router.delete(
  "/multiple",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  courseController.deleteMultipleCourses
);

module.exports = router;
