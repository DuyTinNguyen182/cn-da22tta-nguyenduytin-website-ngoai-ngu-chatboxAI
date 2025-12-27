const languageService = require('../services/languageService');

const getLanguages = async (req, res) => {
    try {
        const languages = await languageService.getAllLanguages();
        res.json(languages);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addLanguage = async (req, res) => {
    const { languageid, language } = req.body;    

    if (languageid && /[^A-Z]/.test(languageid)) {
      return res.status(400).json({ message: "Mã ngôn ngữ phải là chữ in hoa, không chứa số và ký tự đặc biệt" });
    }

    if (language && /[^a-zA-ZÀ-ỹ\s]/.test(language)) {
      return res.status(400).json({ message: "Tên ngôn ngữ không hợp lệ" });
    }

    try {
        await languageService.createLanguage(req.body);
        res.status(201).json({ message: 'Language added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add language' });
    }
};


const deleteMultipleLanguages = async (req, res) => {
    try {
        const result = await languageService.deleteLanguages(req.body.languageIds);

        if (!result.success) {
            return res.status(400).json({
                message: 'Cannot delete. This language is currently in use by teachers.',
                usedLanguageIds: result.usedLanguageIds,
            });
        }

        res.json({ message: 'Languages deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Delete failed' });
    }
};

const getLanguageById = async (req, res) => {
    try {
        const lang = await languageService.getLanguageById(req.params.id);
        if (!lang) return res.status(404).json({ message: 'Not found' });
        res.json(lang);
    } catch (err) {
        console.error('Error fetching language:', err);
        res.status(500).json({ message: 'Error fetching language' });
    }
};

const updateLanguage = async (req, res) => {
    const { language } = req.body;
    if (language && /[^a-zA-ZÀ-ỹ\s]/.test(language)) {
      return res.status(400).json({ message: "Tên ngôn ngữ không hợp lệ" });
    }
    try {
        const updated = await languageService.updateLanguageById(req.params.id, req.body.language);
        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Update successful' });
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
};

module.exports = {
    getLanguages,
    addLanguage,
    deleteMultipleLanguages,
    getLanguageById,
    updateLanguage,
};
