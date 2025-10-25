const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageLevelController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: LanguageLevels
 *   description: Quản lý trình độ ngôn ngữ
 */

/**
 * @swagger
 * /languagelevel:
 *   get:
 *     summary: Lấy tất cả trình độ ngôn ngữ
 *     tags: [LanguageLevels]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', languageController.getAllLanguageslevel);

/**
 * @swagger
 * /languagelevel/add:
 *   post:
 *     summary: Thêm trình độ ngôn ngữ mới
 *     tags: [LanguageLevels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language_levelid
 *               - language_level
 *             properties:
 *               language_levelid:
 *                 type: string
 *                 description: Mã trình độ (duy nhất)
 *               language_level:
 *                 type: string
 *                 description: Tên trình độ ngôn ngữ
 *     responses:
 *       201:
 *         description: Thêm trình độ ngôn ngữ thành công
 */
router.post('/add', authMiddleware.authenticate, authMiddleware.isAdmin, languageController.addLanguagelevel);

/**
 * @swagger
 * /languagelevel/multiple:
 *   delete:
 *     summary: Xóa nhiều trình độ ngôn ngữ
 *     tags: [LanguageLevels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - languagelevelIds
 *             properties:
 *               languagelevelIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách ID (_id trong MongoDB) cần xóa
 *     responses:
 *       200:
 *         description: Xóa trình độ thành công
 *       400:
 *         description: Danh sách ID không hợp lệ hoặc đang được sử dụng
 */
router.delete('/multiple', authMiddleware.authenticate, authMiddleware.isAdmin, languageController.deleteMultipleLanguagelevel);

/**
 * @swagger
 * /languagelevel/{id}:
 *   get:
 *     summary: Lấy trình độ ngôn ngữ theo ID
 *     tags: [LanguageLevels]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: _id của trình độ ngôn ngữ
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy trình độ
 */
router.get('/:id', languageController.getLanguageLevelById);

/**
 * @swagger
 * /languagelevel/{id}:
 *   put:
 *     summary: Cập nhật thông tin trình độ ngôn ngữ
 *     tags: [LanguageLevels]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: _id trình độ cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language_levelid:
 *                 type: string
 *                 description: Mã trình độ (mới nếu muốn cập nhật)
 *               language_level:
 *                 type: string
 *                 description: Tên trình độ (mới nếu muốn cập nhật)
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy trình độ
 */
router.put('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, languageController.updateLanguageLevel);

module.exports = router;
