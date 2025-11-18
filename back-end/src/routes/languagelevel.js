const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageLevelController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', languageController.getAllLanguageslevel);
router.post('/add', authMiddleware.authenticate, authMiddleware.isAdmin, languageController.addLanguagelevel);
router.delete('/multiple', authMiddleware.authenticate, authMiddleware.isAdmin, languageController.deleteMultipleLanguagelevel);
router.get('/:id', languageController.getLanguageLevelById);
router.put('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, languageController.updateLanguageLevel);

module.exports = router;
