const express = require('express');
const router = express.Router();
const courseController = require('../controllers/CourseController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Quản lý khóa học
 */

/**
 * @swagger
 * /course:
 *   get:
 *     summary: Lấy tất cả khóa học
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', courseController.getAllCourses);

/**
 * @swagger
 * /course/{id}:
 *   get:
 *     summary: Lấy thông tin khóa học theo ID
 *     tags: [Courses]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khóa học
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy khóa học
 */
router.get('/:id', courseController.getCourseById);

/**
 * @swagger
 * /course:
 *   post:
 *     summary: Tạo mới một khóa học
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language_id
 *               - languagelevel_id
 *               - teacher_id
 *             properties:
 *               language_id:
 *                 type: string
 *               languagelevel_id:
 *                 type: string
 *               teacher_id:
 *                 type: string
 *               Start_Date:
 *                 type: string
 *                 format: date
 *               Number_of_periods:
 *                 type: number
 *               Tuition:
 *                 type: number
 *               Description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo khóa học thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', authMiddleware.authenticate, authMiddleware.isAdmin, courseController.createCourse);

/**
 * @swagger
 * /course/{id}:
 *   put:
 *     summary: Cập nhật khóa học theo ID
 *     tags: [Courses]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID khóa học cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language_id:
 *                 type: string
 *               languagelevel_id:
 *                 type: string
 *               teacher_id:
 *                 type: string
 *               Start_Date:
 *                 type: string
 *                 format: date
 *               Number_of_periods:
 *                 type: number
 *               Tuition:
 *                 type: number
 *               Description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy khóa học
 */
router.put('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, courseController.updateCourse);

/**
 * @swagger
 * /course/delete-many:
 *   delete:
 *     summary: Xóa nhiều khóa học theo _id
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseIds
 *             properties:
 *               courseIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, courseController.deleteMultipleCourses);

module.exports = router;
