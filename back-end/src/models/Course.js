const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({  
  courseid: { type: String, required: true, unique: true },
  language_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Language' },
  languagelevel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Language_Level' },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  Start_Date: {type: Date},
  Number_of_periods: {type: Number},
  Tuition: {type: Number},
  Description: {type: String}
});

module.exports = mongoose.model('Course', CourseSchema);
