// controllers/languageLevelController.js
const languageLevelService = require('../services/languageLevelService');

const getAllLanguageslevel = async (req, res) => {
    try {
        const levels = await languageLevelService.getAll();
        res.json(levels);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addLanguagelevel = async (req, res) => {
    const { language_levelid, language_level } = req.body;

    if (language_levelid && /[^A-Z0-9]/.test(language_levelid)) {
      return res.status(400).json({ message: "Mã trình độ phải là chữ in hoa và không chứa ký tự đặc biệt" });
    }    
    if (language_level && /[^a-zA-ZÀ-ỹ0-9\s]/.test(language_level)) {
      return res.status(400).json({ message: "Tên trình độ không hợp lệ" });
    }
    try {
        await languageLevelService.add(req.body);
        res.status(201).json({ message: 'Language level added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add language level' });
    }
};

const deleteMultipleLanguagelevel = async (req, res) => {
    
    try {        
        const result = await languageLevelService.deleteMany(req.body.languagelevelIds);
    
        if (!result.success) {
            return res.status(400).json({
                message: 'Cannot delete. This languagelevel is currently in use for another course.',
                usedLanguagelevelIds: result.usedLanguagelevelIds,
            });
        }        
        res.json({ message: 'Language levels deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' });
    }
};

const getLanguageLevelById = async (req, res) => {
    try {
        const lang = await languageLevelService.getById(req.params.id);
        if (!lang) return res.status(404).json({ message: 'Not found' });
        res.json(lang);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching language level' });
    }
};

const updateLanguageLevel = async (req, res) => {
    const { language_level } = req.body;
    if (language_level && /[^a-zA-ZÀ-ỹ0-9\s]/.test(language_level)) {
      return res.status(400).json({ message: "Tên trình độ không hợp lệ" });
    }
    try {
        const updated = await languageLevelService.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Update successful' });
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
};

module.exports = {
    getAllLanguageslevel,
    addLanguagelevel,
    deleteMultipleLanguagelevel,
    getLanguageLevelById,
    updateLanguageLevel
};
