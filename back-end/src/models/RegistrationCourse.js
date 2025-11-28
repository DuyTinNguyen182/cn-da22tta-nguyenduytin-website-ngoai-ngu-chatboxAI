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
