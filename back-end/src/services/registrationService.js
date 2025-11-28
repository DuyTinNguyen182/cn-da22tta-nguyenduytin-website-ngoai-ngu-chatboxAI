const RegistrationCourse = require("../models/RegistrationCourse");

const coursePopulate = {
  path: "course_id",
  // select: 'Start_Date Number_of_periods Tuition Description',
  populate: [
    { path: "language_id", model: "Language", select: "language" },
    {
      path: "languagelevel_id",
      model: "Language_Level",
      select: "language_level",
    },
    { path: "teacher_id", model: "Teacher", select: "full_name" },
  ],
};

const registerCourse = async (userId, courseId, classSessionId) => {
  const existing = await RegistrationCourse.findOne({
    user_id: userId,
    course_id: courseId,
  });
  if (existing) return { status: "already_registered" };

  const registration = new RegistrationCourse({
    user_id: userId,
    course_id: courseId,
    class_session_id: classSessionId,
  });
  await registration.save();

  return { status: "success", registration };
};

const getCoursesByUser = async (userId) => {
  return await RegistrationCourse.find({ user_id: userId })
    .populate("user_id")
    .populate("class_session_id", "days time")
    .populate(coursePopulate);
};

const getUsersByCourse = async (courseId) => {
  return await RegistrationCourse.find({ course_id: courseId })
    .populate("user_id")
    .populate("class_session_id", "days time")
    .populate(coursePopulate);
};

const getAllRegistrations = async () => {
  return await RegistrationCourse.find()
    .populate("user_id", "userid fullname")
    .populate("class_session_id", "days time")
    .populate(coursePopulate);
};

const getRegistrationById = async (id) => {
  return await RegistrationCourse.findById(id)
    .populate("user_id")
    .populate("class_session_id", "days time")
    .populate(coursePopulate);
};

const cancelRegistration = async (id) => {
  const deleted = await RegistrationCourse.findByIdAndDelete(id);
  return !!deleted;
};

const deleteManyRegistrations = async (ids) => {
  const paidRegistrations = await RegistrationCourse.countDocuments({
    _id: { $in: ids },
    isPaid: true,
  });

  if (paidRegistrations > 0) {
    throw new Error("Không thể xóa các đăng ký đã được thanh toán.");
  }

  return await RegistrationCourse.deleteMany({ _id: { $in: ids } });
};

const updateRegistration = async (id, data) => {
  const updated = await RegistrationCourse.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updated;
};

const updatePaymentStatus = async (registrationId, userId, isAdmin = false) => {
  const query = { _id: registrationId };

  if (!isAdmin) {
    query.user_id = userId;
  }

  const updatedRegistration = await RegistrationCourse.findOneAndUpdate(
    query,
    {
      isPaid: true,
      paymentDate: new Date(),
    },
    { new: true }
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
  deleteManyRegistrations,
  updateRegistration,
  updatePaymentStatus,
};
