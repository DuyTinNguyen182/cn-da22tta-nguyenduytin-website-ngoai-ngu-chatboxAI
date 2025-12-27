const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "review_date", updatedAt: true },
  }
);
ReviewSchema.index({ course_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
