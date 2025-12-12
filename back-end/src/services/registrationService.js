const RegistrationCourse = require("../models/RegistrationCourse");
const Coupon = require("../models/Coupon");
const Course = require("../models/Course");

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

const registerCourse = async (data) => {
  const { user_id, course_id, class_session_id, payment_method, coupon_id } =
    data;

  const existing = await RegistrationCourse.findOne({
    user_id: user_id,
    course_id: course_id,
  });
  if (existing) return { status: "already_registered" };

  const course = await Course.findById(course_id);
  if (!course) throw new Error("Khóa học không tồn tại");

  const originalPrice = course.discounted_price || course.Tuition;
  let finalAmount = originalPrice;
  let discountAmount = 0;
  let appliedCouponId = null;

  if (coupon_id) {
    const coupon = await Coupon.findById(coupon_id);
    if (coupon) {
      if (coupon.discount_type === "percent") {
        discountAmount = (originalPrice * coupon.discount_value) / 100;
        if (
          coupon.max_discount_amount &&
          discountAmount > coupon.max_discount_amount
        ) {
          discountAmount = coupon.max_discount_amount;
        }
      } else {
        discountAmount = coupon.discount_value;
      }
      if (discountAmount > originalPrice) discountAmount = originalPrice;

      finalAmount = originalPrice - discountAmount;
      appliedCouponId = coupon._id;
    }
  }

  const registration = new RegistrationCourse({
    user_id: user_id,
    course_id: course_id,
    class_session_id: class_session_id,
    payment_method: payment_method || "vnpay",

    coupon_id: appliedCouponId,
    discount_amount: discountAmount,
    final_amount: finalAmount,
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
  const registration = await RegistrationCourse.findById(id);

  if (!registration) return false;
  if (
    registration.coupon_id &&
    (registration.isPaid || registration.payment_method === "cash")
  ) {
    await Coupon.findByIdAndUpdate(registration.coupon_id, {
      $inc: { usage_count: -1 },
    });
    console.log(
      `Đã hoàn lại lượt dùng cho mã giảm giá: ${registration.coupon_id}`
    );
  }
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

const deleteUnpaidRegistrations = async () => {
  // Lấy thời gian 15 phút trước
  const timeLimit = new Date(Date.now() - 15 * 60 * 1000);

  // Tìm các đơn: Chưa thanh toán AND Tạo trước timeLimit AND là VNPay
  const overdueRegistrations = await RegistrationCourse.find({
    isPaid: false,
    createdAt: { $lt: timeLimit },
    payment_method: "vnpay",
  });

  if (overdueRegistrations.length > 0) {
    console.log(
      `Tìm thấy ${overdueRegistrations.length} đơn quá hạn. Đang xóa...`
    );

    for (const reg of overdueRegistrations) {
      await RegistrationCourse.findByIdAndDelete(reg._id);
    }

    console.log("Đã dọn dẹp xong.");
  }
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
  deleteUnpaidRegistrations,
};
