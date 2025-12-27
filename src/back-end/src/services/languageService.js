const Language = require('../models/Language');
const Teacher = require('../models/Teacher');

const getAllLanguages = async () => {
    return await Language.find();
};

const createLanguage = async ({ languageid, language }) => {
    const newLanguage = new Language({ languageid, language });
    await newLanguage.save();
    return true;
};

const deleteLanguages = async (languageIds) => {
    const teachersUsing = await Teacher.find({ language_id: { $in: languageIds } });

    if (teachersUsing.length > 0) {
        const usedLanguageIds = teachersUsing.map(t => t.language_id.toString());
        return { success: false, usedLanguageIds };
    }

    await Language.deleteMany({ _id: { $in: languageIds } });
    return { success: true };
};

const getLanguageById = async (id) => {
    return await Language.findById(id);
};

const updateLanguageById = async (id, language) => {
    return await Language.findByIdAndUpdate(id, { language }, { new: true });
};

module.exports = {
    getAllLanguages,
    createLanguage,
    deleteLanguages,
    getLanguageById,
    updateLanguageById,
};
