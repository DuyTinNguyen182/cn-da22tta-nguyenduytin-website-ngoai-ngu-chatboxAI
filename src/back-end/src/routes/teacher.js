const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', teacherController.getAllTeachers);
router.get('/:id', teacherController.getTeacherById);
router.post('/', authMiddleware.authenticate, authMiddleware.isAdmin, teacherController.createTeacher);
router.put('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, teacherController.updateTeacher);
router.delete('/multiple', authMiddleware.authenticate, authMiddleware.isAdmin, teacherController.deleteMultipleTeachers);

module.exports = router;
