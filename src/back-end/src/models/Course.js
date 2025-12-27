const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    courseid: { type: String, required: true, unique: true },
    language_id: { type: mongoose.Schema.Types.ObjectId, ref: "Language" },
    languagelevel_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language_Level",
    },
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    Start_Date: { type: Date, required: true },
    Number_of_periods: { type: Number, required: true },
    Tuition: { type: Number, required: true },
    Description: { type: String },

    image: {
      type: String,
      default: "",
    },
    end_date: { type: Date, required: true },
    discount_percent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Tự động tính toán trạng thái
CourseSchema.virtual("status").get(function () {
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const startDate = new Date(new Date(this.Start_Date).setHours(0, 0, 0, 0));
  const endDate = new Date(new Date(this.end_date).setHours(23, 59, 59, 999));

  if (today > endDate) {
    return "finished";
  }
  if (todayStart >= startDate) {
    return "ongoing";
  }
  return "upcoming";
});

// Tự động tính toán giá sau khi giảm
CourseSchema.virtual("discounted_price").get(function () {
  if (this.discount_percent > 0) {
    const discountAmount = Math.round(
      (this.Tuition * this.discount_percent) / 100
    );
    return this.Tuition - discountAmount;
  }
  return this.Tuition;
});

// Lấy số lượng đăng ký
CourseSchema.virtual("registration_count", {
  ref: "Registration_Course", // Tên Model đăng ký
  localField: "_id",
  foreignField: "course_id",
  count: true,
});

module.exports = mongoose.model("Course", CourseSchema);
