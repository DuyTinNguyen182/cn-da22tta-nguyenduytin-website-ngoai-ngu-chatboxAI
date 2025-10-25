// services/courseService.js
const Course = require('../models/Course');

const getAll = async () => {
  const courses = await Course.find()
    .populate('language_id')
    .populate('languagelevel_id')
    .populate('teacher_id');

  return courses.map(course => ({
    id: course._id.toString(),
    courseid: course.courseid,

    language_id: course.language_id?._id.toString(),
    language: course.language_id?.language || '',

    languagelevel_id: course.languagelevel_id?._id.toString(),
    languagelevel: course.languagelevel_id?.language_level || '',

    teacher_id: course.teacher_id?._id.toString(),
    teacher_name: course.teacher_id?.full_name || '',

    Start_Date: course.Start_Date,
    Number_of_periods: course.Number_of_periods,
    Tuition: course.Tuition,
    Description: course.Description
  }));
};

const getById = async (id) => {
  return await Course.findById(id);
};

const generateUniqueCourseId = async () => {
  let courseid;
  let isUnique = false;

  while (!isUnique) {
    const randomNumber = Math.floor(Math.random() * 1000);
    const formattedId = `KH${randomNumber.toString().padStart(4, '0')}`;
    const existing = await Course.findOne({ courseid: formattedId });
    if (!existing) {
      courseid = formattedId;
      isUnique = true;
    }
  }

  return courseid;
};

const create = async (data) => {
  const courseid = await generateUniqueCourseId();

  const newCourse = new Course({
    courseid,
    language_id: data.language_id,
    languagelevel_id: data.languagelevel_id,
    teacher_id: data.teacher_id,
    Start_Date: data.Start_Date,
    Number_of_periods: data.Number_of_periods,
    Tuition: data.Tuition,
    Description: data.Description || ''
  });

  return await newCourse.save();
};

const update = async (id, data) => {
  return await Course.findByIdAndUpdate(id, data, { new: true });
};

const deleteMany = async (ids) => {
  return await Course.deleteMany({ _id: { $in: ids } });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteMany
};
