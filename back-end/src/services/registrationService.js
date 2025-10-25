const RegistrationCourse = require("../models/RegistrationCourse");

// --- Hàm populate dùng lại nhiều ---
const coursePopulate = {
  path: "course_id",
  // select: 'Start_Date Number_of_periods Tuition Description', 
  populate: [
    { path: "language_id", model: "Language", select: "language" },
    { path: "languagelevel_id", model: "Language_Level", select: "language_level" },
    { path: "teacher_id", model: "Teacher", select: "full_name" },
  ],
};

// Đăng ký khóa học
const registerCourse = async (userId, courseId) => {
  const existing = await RegistrationCourse.findOne({ user_id: userId, course_id: courseId });
  if (existing) return { status: "already_registered" };

  const registration = new RegistrationCourse({ user_id: userId, course_id: courseId });
  await registration.save();

  return { status: "success", registration };
};

// Lấy danh sách khóa học theo user
const getCoursesByUser = async (userId) => {
  return await RegistrationCourse.find({ user_id: userId })
    .populate("user_id")
    .populate(coursePopulate);
};

// Lấy danh sách học viên theo course
const getUsersByCourse = async (courseId) => {
  return await RegistrationCourse.find({ course_id: courseId })
    .populate("user_id")
    .populate(coursePopulate);
};

// Lấy toàn bộ đăng ký (cho admin)
const getAllRegistrations = async () => {
  return await RegistrationCourse.find()
    .populate("user_id", "userid fullname")
    .populate(coursePopulate);
};

// Lấy đăng ký theo ID
const getRegistrationById = async (id) => {
  return await RegistrationCourse.findById(id)
    .populate("user_id")
    .populate(coursePopulate);
};

// Hủy đăng ký
const cancelRegistration = async (id) => {
  const deleted = await RegistrationCourse.findByIdAndDelete(id);
  return !!deleted;
};

// Cập nhật trạng thái / điểm số
const updateRegistration = async (id, data) => {
  const updated = await RegistrationCourse.findByIdAndUpdate(id, data, { new: true });
  return updated;
};

// Cập nhật trạng thái thanh toán
const updatePaymentStatus = async (registrationId, userId, isAdmin = false) => {
  const query = { _id: registrationId };

  // Nếu không phải admin, phải đảm bảo người dùng chỉ cập nhật được đăng ký của chính mình
  if (!isAdmin) {
    query.user_id = userId;
  }

  const updatedRegistration = await RegistrationCourse.findOneAndUpdate(
    query,
    { isPaid: true },
    { new: true } // Trả về document sau khi đã cập nhật
  );

  return updatedRegistration;
};

module.exports = {
  registerCourse,
  getCoursesByUser,
  getUsersByCourse,
  getAllRegistrations,
  getRegistrationById,
  cancelRegistration,
  updateRegistration,
  updatePaymentStatus,
};
