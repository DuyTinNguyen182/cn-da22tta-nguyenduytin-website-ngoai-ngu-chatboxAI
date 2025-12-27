const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', languageController.getLanguages);
router.post('/add', authMiddleware.authenticate, authMiddleware.isAdmin, languageController.addLanguage);
router.delete('/multiple', authMiddleware.authenticate, authMiddleware.isAdmin, languageController.deleteMultipleLanguages);
router.get('/:id', languageController.getLanguageById);
router.put('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, languageController.updateLanguage);

module.exports = router;
