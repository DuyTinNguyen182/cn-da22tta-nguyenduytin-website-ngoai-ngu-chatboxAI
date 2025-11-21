const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.authenticate, authMiddleware.isAdmin, reviewController.getAllReviews);
router.get('/course/:courseId', reviewController.getReviewsByCourse);
router.post('/', authMiddleware.authenticate, reviewController.createReview);
router.delete('/multiple', authMiddleware.authenticate, authMiddleware.isAdmin, reviewController.deleteMultipleReviews);
router.put('/:id', authMiddleware.authenticate, reviewController.updateReview);
router.delete('/:id', authMiddleware.authenticate, reviewController.deleteReview);

module.exports = router;