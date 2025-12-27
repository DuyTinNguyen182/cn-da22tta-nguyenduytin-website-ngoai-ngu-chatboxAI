const slideshowService = require("../services/slideshowService");

// Lấy tất cả (Admin)
const getAllSlides = async (req, res) => {
  try {
    const slides = await slideshowService.getAll();
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy slide active (User dùng ở trang chủ)
const getActiveSlides = async (req, res) => {
  try {
    const slides = await slideshowService.getActive();
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSlideById = async (req, res) => {
  try {
    const slide = await slideshowService.getById(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide not found" });
    res.json(slide);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createSlide = async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ message: "Vui lòng chọn ảnh!" });
    }
    const saved = await slideshowService.create(req.body);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateSlide = async (req, res) => {
  try {
    const updated = await slideshowService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Slide not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteSlide = async (req, res) => {
  try {
    await slideshowService.deleteOne(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllSlides,
  getActiveSlides,
  getSlideById,
  createSlide,
  updateSlide,
  deleteSlide,
};
