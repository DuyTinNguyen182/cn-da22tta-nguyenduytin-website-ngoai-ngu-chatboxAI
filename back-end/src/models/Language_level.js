const mongoose = require('mongoose');

const LanguageLevelSchema = new mongoose.Schema({
  language_levelid: { type: String, required: true, unique: true },
  language_level: { type: String, required: true}
});

module.exports = mongoose.model('Language_Level', LanguageLevelSchema);
