const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Teachers
 *   description: Quản lý giảng viên
 */

/**
 * @swagger
 * /teacher:
 *   get:
 *     summary: Lấy danh sách tất cả giảng viên
 *     tags: [Teachers]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', teacherController.getAllTeachers);

/**
 * @swagger
 * /teacher/{id}:
 *   get:
 *     summary: Lấy thông tin giảng viên theo ID
 *     tags: [Teachers]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: _id của giảng viên
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy giảng viên
 */
router.get('/:id', teacherController.getTeacherById);

/**
 * @swagger
 * /teacher:
 *   post:
 *     summary: Thêm mới giảng viên
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Họ tên giảng viên
 *               gender:
 *                 type: string
 *                 enum: [Nam, Nữ]
 *               email:
 *                 type: string
 *               language_id:
 *                 type: string
 *                 description: ID của ngôn ngữ giảng dạy
 *     responses:
 *       201:
 *         description: Thêm giảng viên thành công
 */
router.post('/', authMiddleware.authenticate, authMiddleware.isAdmin, teacherController.createTeacher);

/**
 * @swagger
 * /teacher/{id}:
 *   put:
 *     summary: Cập nhật thông tin giảng viên
 *     tags: [Teachers]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: _id của giảng viên cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               gender:
 *                 type: string
 *               email:
 *                 type: string
 *               language_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy giảng viên
 */
router.put('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, teacherController.updateTeacher);

/**
 * @swagger
 * /teacher/multiple:
 *   delete:
 *     summary: Xóa nhiều giảng viên
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teacherIds
 *             properties:
 *               teacherIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách _id của giảng viên cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc không xóa được
 */
router.delete('/multiple', authMiddleware.authenticate, authMiddleware.isAdmin, teacherController.deleteMultipleTeachers);

module.exports = router;
