const mongoose = require("mongoose");

const RegistrationCourseSchema = new mongoose.Schema(
  {
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    class_session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassSession",
      required: true,
    },
    enrollment_date: { type: Date, default: Date.now },
    // --- PHẦN THÊM MỚI ---
    coupon_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    }, // Mã giảm giá đã áp dụng
    discount_amount: { type: Number, default: 0 }, // Số tiền được giảm
    final_amount: { type: Number }, // Số tiền thực tế phải trả (sau khi trừ hết các loại giảm)
    // ---------------------
    isPaid: { type: Boolean, default: false },
    paymentDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Registration_Course",
  RegistrationCourseSchema
);
