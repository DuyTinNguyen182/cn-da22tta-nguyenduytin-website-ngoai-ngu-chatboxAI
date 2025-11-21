const reviewService = require('../services/reviewService');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getAllReviews = async (req, res) => {
    try {
        const reviews = await reviewService.getAllReviews();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

const getReviewsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!isValidObjectId(courseId)) return res.status(400).json({ message: "Course ID không hợp lệ" });
        
        const reviews = await reviewService.getReviewsByCourse(courseId);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

const createReview = async (req, res) => {
    try {
        const { course_id, rating, comment } = req.body;
        const user_id = req.user.id;

        if (!course_id || !rating) {
            return res.status(400).json({ message: "Thiếu thông tin khóa học hoặc số sao." });
        }
        
        const review = await reviewService.createReview({ course_id, user_id, rating, comment });
        res.status(201).json(review);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Bạn đã đánh giá khóa học này rồi." });
        }
        res.status(500).json({ message: error.message });
    }
};

const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'Admin';

        const updatedReview = await reviewService.updateReview(id, userId, isAdmin, req.body);
        if (!updatedReview) return res.status(404).json({ message: "Không tìm thấy đánh giá" });

        res.json(updatedReview);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'Admin';
        
        const deletedReview = await reviewService.deleteReview(id, userId, isAdmin);
        if (!deletedReview) return res.status(404).json({ message: "Không tìm thấy đánh giá" });
        
        res.json({ message: "Xóa đánh giá thành công" });
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

const deleteMultipleReviews = async (req, res) => {
    try {
        const { reviewIds } = req.body;
        if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
            return res.status(400).json({ message: "reviewIds phải là một mảng không rỗng." });
        }

        for (const id of reviewIds) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: `ID không hợp lệ: ${id}` });
            }
        }
        
        await reviewService.deleteManyReviews(reviewIds);
        res.json({ message: `Đã xóa ${reviewIds.length} đánh giá thành công` });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi xóa nhiều đánh giá." });
    }
};

module.exports = {
    getAllReviews,
    getReviewsByCourse,
    createReview,
    updateReview,
    deleteReview,
    deleteMultipleReviews
};