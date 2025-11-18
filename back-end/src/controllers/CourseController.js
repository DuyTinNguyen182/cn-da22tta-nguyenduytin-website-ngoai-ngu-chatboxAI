const courseService = require("../services/courseService");

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
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

const createCourse = async (req, res) => {
  try {
    const saved = await courseService.create(req.body);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const updated = await courseService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Course not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteMultipleCourses = async (req, res) => {
  try {
    const { courseIds } = req.body;
    await courseService.deleteMany(courseIds);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const incrementCourseViews = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Khởi tạo session viewedCourses
    if (!req.session.viewedCourses) {
      req.session.viewedCourses = [];
    }

    // Nếu đã xem trong session này - không tăng nữa
    if (req.session.viewedCourses.includes(courseId)) {
      return res.json({ message: "Already viewed" });
    }

    const updated = await courseService.incrementViews(courseId);
    if (!updated) return res.status(404).json({ message: "Course not found" });

    // Lưu vào session để không tăng nữa
    req.session.viewedCourses.push(courseId);

    res.json({ message: "View increased" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteMultipleCourses,
  incrementCourseViews,
};
