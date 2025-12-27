const Slideshow = require("../models/Slideshow");

const getAll = async () => {
  return await Slideshow.find().sort({ order: 1, createdAt: -1 });
};

// Lấy chỉ những slide đang hoạt động (Dành cho trang chủ phía người dùng)
const getActive = async () => {
  return await Slideshow.find({ isActive: true }).sort({
    order: 1,
    createdAt: -1,
  });
};

const getById = async (id) => {
  return await Slideshow.findById(id);
};

const create = async (data) => {
  const newSlide = new Slideshow({
    image: data.image,
    title: data.title || "",
    order: data.order || 0,
    isActive: data.isActive !== undefined ? data.isActive : true,
  });
  return await newSlide.save();
};

const update = async (id, data) => {
  return await Slideshow.findByIdAndUpdate(id, data, { new: true });
};

const deleteOne = async (id) => {
  return await Slideshow.findByIdAndDelete(id);
};

module.exports = {
  getAll,
  getActive,
  getById,
  create,
  update,
  deleteOne,
};
