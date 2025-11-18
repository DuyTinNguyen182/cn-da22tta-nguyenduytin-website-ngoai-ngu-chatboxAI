const mongoose = require("mongoose");
const Course = require("../models/Course");

const getAll = async () => {
  const courses = await Course.find({})
    .populate("language_id")
    .populate("languagelevel_id")
    .populate("teacher_id")
    .populate("registration_count"); // Populate trường ảo đếm số lượng

  return courses;
};

const getById = async (id) => {
  const course = await Course.findById(id)
    .populate("language_id")
    .populate("languagelevel_id")
    .populate("teacher_id")
    .populate("registration_count");

  return course;
};

const incrementViews = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error("ID không hợp lệ được truyền cho incrementViews:", id);
    return null;
  }
  return await Course.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  );
};
const generateUniqueCourseId = async () => {
  let courseid;
  let isUnique = false;

  while (!isUnique) {
    const randomNumber = Math.floor(Math.random() * 10000);
    const formattedId = `KH${randomNumber.toString().padStart(4, "0")}`;
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
    end_date: data.end_date,
    Number_of_periods: data.Number_of_periods,
    Tuition: data.Tuition,
    Description: data.Description || "",
    image: data.image,
    discount_percent: data.discount_percent || 0,
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
  deleteMany,
  incrementViews,
};
