const express = require('express');
const router = express.Router();
const courseController = require('../controllers/CourseController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', authMiddleware.authenticate, authMiddleware.isAdmin, courseController.createCourse);
router.put('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, courseController.updateCourse);
router.delete('/multiple', authMiddleware.authenticate, authMiddleware.isAdmin, courseController.deleteMultipleCourses);

module.exports = router;
