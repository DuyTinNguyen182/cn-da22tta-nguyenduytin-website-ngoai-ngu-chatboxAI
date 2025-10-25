// controllers/teacherController.js
const teacherService = require("../services/teacherService");

const getAllTeachers = async (req, res) => {
  try {
    const teachers = await teacherService.getAll();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const teacher = await teacherService.getById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    res.status(404).json({ message: "Teacher not found" });
  }
};

const createTeacher = async (req, res) => {
  const { full_name } = req.body;
  if (full_name && /[^a-zA-ZÀ-ỹ\s]/.test(full_name)) {
    return res.status(400).json({ message: "Họ tên không hợp lệ" });
  }
  try {
    const newTeacher = await teacherService.create(req.body);
    res.status(201).json(newTeacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateTeacher = async (req, res) => {
  const { full_name } = req.body;
  if (full_name && /[^a-zA-ZÀ-ỹ\s]/.test(full_name)) {
    return res.status(400).json({ message: "Họ tên không hợp lệ" });
  }
  try {
    const updated = await teacherService.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteMultipleTeachers = async (req, res) => {
  
  try {
    const result = await teacherService.deleteMany(req.body.teacherIds);

    if (!result.success) {
      return res.status(400).json({
        message:
          "Cannot delete. This teacher is currently in use for another course.",
        usedTeacherIds: result.usedTeacherIds,
      });
    }
    await teacherService.deleteMany(req.body.teacherIds);
    res.json({ message: "Teachers deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteMultipleTeachers,
};
