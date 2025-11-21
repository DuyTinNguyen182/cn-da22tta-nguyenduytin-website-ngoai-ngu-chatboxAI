const Review = require("../models/Review");

const getAllReviews = async () => {
  return await Review.find({})
    .populate("user_id", "fullname userid avatar")
    .populate("course_id", "courseid");
};

const getReviewsByCourse = async (courseId) => {
  return await Review.find({ course_id: courseId })
    .populate("user_id", "fullname userid avatar")
    .sort({ review_date: -1 });
};

const createReview = async (data) => {
  const newReview = new Review(data);
  return await newReview.save();
};

const updateReview = async (reviewId, userId, isAdmin, data) => {
  const review = await Review.findById(reviewId);
  if (!review) return null;

  if (!isAdmin && review.user_id.toString() !== userId) {
    throw new Error("Bạn không có quyền sửa đánh giá này.");
  }

  review.rating = data.rating ?? review.rating;
  review.comment = data.comment ?? review.comment;

  return await review.save();
};

const deleteReview = async (reviewId, userId, isAdmin) => {
  const review = await Review.findById(reviewId);
  if (!review) return null;

  if (!isAdmin && review.user_id.toString() !== userId) {
    throw new Error("Bạn không có quyền xóa đánh giá này.");
  }

  return await Review.findByIdAndDelete(reviewId);
};

const deleteManyReviews = async (reviewIds) => {
  return await Review.deleteMany({ _id: { $in: reviewIds } });
};

module.exports = {
  getAllReviews,
  getReviewsByCourse,
  createReview,
  updateReview,
  deleteReview,
  deleteManyReviews,
};
