const couponService = require("../services/couponService");

// --- ADMIN CONTROLLERS ---

exports.createCoupon = async (req, res) => {
  try {
    const newCoupon = await couponService.createCoupon(req.body);
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponService.getAllCoupons();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tải danh sách mã giảm giá" });
  }
};

exports.getCouponById = async (req, res) => {
  try {
    const coupon = await couponService.getCouponById(req.params.id);
    res.status(200).json(coupon);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const updatedCoupon = await couponService.updateCoupon(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedCoupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCoupons = async (req, res) => {
  try {
    const { couponIds } = req.body;
    await couponService.deleteCoupons(couponIds);
    res.status(200).json({ message: "Đã xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa mã giảm giá" });
  }
};

// --- USER CONTROLLERS ---

exports.getAvailableCoupons = async (req, res) => {
  try {
    const coupons = await couponService.getAvailableCoupons();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { registrationId, couponCode } = req.body;
    const result = await couponService.applyCouponToRegistration(
      registrationId,
      couponCode
    );
    res.status(200).json(result);
  } catch (error) {
    // Nếu lỗi do logic (VD: hết hạn, không tìm thấy) trả về 400
    // Các lỗi khác trả về 500
    const status =
      error.message.includes("không tồn tại") ||
      error.message.includes("hết hạn") ||
      error.message.includes("hết lượt") ||
      error.message.includes("đơn đăng ký")
        ? 400
        : 500;
    res.status(status).json({ message: error.message });
  }
};
