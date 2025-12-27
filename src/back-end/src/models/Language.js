const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema({
  languageid: { type: String, required: true, unique: true },
  language: { type: String, required: true}
});


const Language = mongoose.model('Language', LanguageSchema);

module.exports = Language
