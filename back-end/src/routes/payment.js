const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// Tạo URL thanh toán
router.post(
  "/create_payment_url",
  authMiddleware.authenticate, // Chỉ user đã đăng nhập mới được tạo thanh toán
  paymentController.createPaymentUrl
);

// Lắng nghe IPN từ VNPay (không cần xác thực)
router.get("/vnpay_ipn", paymentController.vnpayIpn);

module.exports = router;