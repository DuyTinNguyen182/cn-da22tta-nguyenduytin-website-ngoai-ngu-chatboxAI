// controllers/courseController.js
const courseService = require('../services/courseService');

const getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAll();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await courseService.getById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course is not exist' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createCourse = async (req, res) => {
  const { Number_of_periods, Tuition } = req.body;
    if (Number_of_periods && Number_of_periods < 0) {
      return res.status(400).json({ message: "Số tiết không hợp lệ" });
    }
    if (Tuition && Tuition < 0) {
      return res.status(400).json({ message: "Học phí không hợp lệ" });
    }
  try {
    const saved = await courseService.create(req.body);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateCourse = async (req, res) => {
  const { Number_of_periods, Tuition } = req.body;
    if (Number_of_periods && Number_of_periods < 0) {
      return res.status(400).json({ message: "Số tiết không hợp lệ" });
    }
    if (Tuition && Tuition < 0) {
      return res.status(400).json({ message: "Học phí không hợp lệ" });
    }
  try {
    const updated = await courseService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Course not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteMultipleCourses = async (req, res) => {
  try {
    const { courseIds } = req.body;
    if (!Array.isArray(courseIds)) {
      return res.status(400).json({ message: 'courseIds must be an array' });
    }

    await courseService.deleteMany(courseIds);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteMultipleCourses
};
