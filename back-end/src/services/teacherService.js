// services/teacherService.js
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");

const getAll = async () => {
  return await Teacher.find().populate("language_id");
};

const getById = async (id) => {
  return await Teacher.findById(id).populate("language_id");
};

const generateUniqueTeacherId = async () => {
  let teacherid;
  let isUnique = false;

  while (!isUnique) {
    const randomNumber = Math.floor(Math.random() * 100000);
    const formattedId = `GV${randomNumber.toString().padStart(6, "0")}`;
    const existing = await Teacher.findOne({ teacherid: formattedId });
    if (!existing) {
      teacherid = formattedId;
      isUnique = true;
    }
  }

  return teacherid;
};

const create = async (data) => {
  const existingTeacher = await Teacher.findOne({ email: data.email });
  if (existingTeacher) {
    throw new Error("Email đã được sử dụng");
  }

  const teacherid = await generateUniqueTeacherId();

  const newTeacher = new Teacher({
    teacherid,
    full_name: data.full_name,
    gender: data.gender,
    email: data.email,
    language_id: data.language_id,
  });

  return await newTeacher.save();
};

const update = async (id, data) => {
  return await Teacher.findByIdAndUpdate(
    id,
    {
      full_name: data.full_name,
      email: data.email,
      language_id: data.language_id,
    },
    { new: true }
  );
};

const deleteMany = async (ids) => {
  const CoursesUsing = await Course.find({ teacher_id: { $in: ids } });

  if (CoursesUsing.length > 0) {
    const usedTeacherIds = CoursesUsing.map((t) =>
      t.teacher_id.toString()
    );
    return { success: false, usedTeacherIds };
  }
  await Teacher.deleteMany({ _id: { $in: ids } });
  return { success: true };
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteMany,
};
