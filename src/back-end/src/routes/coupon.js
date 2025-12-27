const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");

// --- USER ROUTES (Người dùng thường) ---

// Lấy danh sách mã đang khuyến mãi (User xem banner/list để chọn)
router.get("/available", couponController.getAvailableCoupons);

// User nhập mã code để áp dụng vào đơn hàng
router.post(
  "/apply",
  authMiddleware.authenticate,
  couponController.applyCoupon
);

// --- ADMIN ROUTES (Cần quyền Admin) ---

// Lấy tất cả danh sách (bao gồm mã ẩn/hết hạn) cho bảng Admin
router.get(
  "/",
  authMiddleware.authenticate,
  authMiddleware.isAdmin, // Middleware kiểm tra quyền Admin
  couponController.getAllCoupons
);

// Tạo mã mới
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  couponController.createCoupon
);

// Xóa nhiều mã cùng lúc
router.delete(
  "/multiple",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  couponController.deleteCoupons
);

// Lấy chi tiết 1 mã (để hiện vào form Update)
router.get(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  couponController.getCouponById
);

// Cập nhật mã
router.put(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  couponController.updateCoupon
);

module.exports = router;
