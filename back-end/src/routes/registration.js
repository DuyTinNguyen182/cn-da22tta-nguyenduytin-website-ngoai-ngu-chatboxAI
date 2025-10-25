const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");
const authMiddleware = require('../middleware/authMiddleware');

// Lấy tất cả đăng ký
router.get("/", registrationController.getAllRegistrations);

// Đăng ký khóa học
router.post("/", registrationController.registerCourse);

// Lấy danh sách khóa học của một user
router.get("/user/:userId", registrationController.getCoursesByUser);

// Lấy danh sách học viên của một course
router.get("/course/:courseId", registrationController.getUsersByCourse);

router.get("/:id", registrationController.getRegistrationById);

// Hủy đăng ký theo id đăng ký
router.delete("/:id", registrationController.cancelRegistration);

// Cập nhật đăng ký (theo id đăng ký)
router.put("/:id", registrationController.updateRegistration);

// Route cho người dùng tự thanh toán (cập nhật isPaid = true)
router.patch(
  "/:id/pay",
  authMiddleware.authenticate, // Cần xác thực người dùng
  registrationController.processUserPayment
);

// Route cho admin xác nhận đã thanh toán
router.patch(
  "/:id/confirm-payment",
  authMiddleware.authenticate, authMiddleware.isAdmin,
  registrationController.confirmPaymentByAdmin
);

module.exports = router;

