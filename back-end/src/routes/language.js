const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Languages
 *   description: Quản lý ngôn ngữ
 */

/**
 * @swagger
 * /language:
 *   get:
 *     summary: Lấy danh sách tất cả ngôn ngữ
 *     tags: [Languages]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', languageController.getLanguages);

/**
 * @swagger
 * /language/add:
 *   post:
 *     summary: Thêm ngôn ngữ mới
 *     tags: [Languages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - languageid
 *               - language
 *             properties:
 *               languageid:
 *                 type: string
 *                 description: Mã định danh ngôn ngữ (unique)
 *               language:
 *                 type: string
 *                 description: Tên ngôn ngữ
 *     responses:
 *       201:
 *         description: Thêm thành công
 */
router.post('/add', authMiddleware.authenticate, authMiddleware.isAdmin, languageController.addLanguage);

/**
 * @swagger
 * /language/multiple:
 *   delete:
 *     summary: Xóa nhiều ngôn ngữ
 *     tags: [Languages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - languageIds
 *             properties:
 *               languageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách ID ngôn ngữ cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/multiple', authMiddleware.authenticate, authMiddleware.isAdmin, languageController.deleteMultipleLanguages);

/**
 * @swagger
 * /language/{id}:
 *   get:
 *     summary: Lấy ngôn ngữ theo ID
 *     tags: [Languages]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy ngôn ngữ
 */
router.get('/:id', languageController.getLanguageById);

/**
 * @swagger
 * /language/{id}:
 *   put:
 *     summary: Cập nhật thông tin ngôn ngữ
 *     tags: [Languages]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB `_id` của ngôn ngữ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 description: Tên ngôn ngữ mới
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy ngôn ngữ
 */
router.put('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, languageController.updateLanguage);

module.exports = router;
