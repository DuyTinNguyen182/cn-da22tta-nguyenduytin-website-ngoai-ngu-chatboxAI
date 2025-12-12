const Coupon = require("../models/Coupon");
const RegistrationCourse = require("../models/RegistrationCourse");

// Tạo mã giảm giá mới
exports.createCoupon = async (data) => {
  const { code } = data;
  // Kiểm tra trùng mã
  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) {
    throw new Error("Mã code này đã tồn tại!");
  }

  const newCoupon = new Coupon({
    ...data,
    code: code.toUpperCase(),
  });
  return await newCoupon.save();
};

// Lấy tất cả mã (Cho Admin)
exports.getAllCoupons = async () => {
  return await Coupon.find().sort({ createdAt: -1 });
};

// Lấy chi tiết mã theo ID
exports.getCouponById = async (id) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new Error("Không tìm thấy mã giảm giá");
  return coupon;
};

// Cập nhật mã
exports.updateCoupon = async (id, data) => {
  const updateData = { ...data };
  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!updatedCoupon) throw new Error("Không tìm thấy mã để cập nhật");
  return updatedCoupon;
};

// Xóa nhiều mã
exports.deleteCoupons = async (ids) => {
  return await Coupon.deleteMany({ _id: { $in: ids } });
};

// Lấy danh sách mã khả dụng (Cho User)
exports.getAvailableCoupons = async () => {
  const now = new Date();
  return await Coupon.find({
    isActive: true,
    // start_date: { $lte: now }, // Đã bắt đầu
    // expiration_date: { $gte: now }, // Chưa hết hạn
    // $expr: {
    //   $cond: {
    //     if: { $ifNull: ["$usage_limit", false] }, // Nếu có giới hạn
    //     then: { $lt: ["$usage_count", "$usage_limit"] }, // Kiểm tra count < limit
    //     else: true, // Không giới hạn thì luôn đúng
    //   },
    // },
  }).select(" -createdAt -updatedAt"); // Ẩn thông tin nội bộ
};

// Logic Áp dụng mã
exports.applyCouponToRegistration = async (registrationId, couponCode) => {
  // a. Tìm đơn đăng ký
  const registration = await RegistrationCourse.findById(
    registrationId
  ).populate("course_id");
  if (!registration) throw new Error("Không tìm thấy đơn đăng ký");
  if (registration.isPaid) throw new Error("Đơn này đã thanh toán rồi");

  // Tìm mã giảm giá
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });

  if (!coupon) throw new Error("Mã giảm giá không tồn tại hoặc đã bị khóa");

  // Validate thời gian
  const now = new Date();
  if (now < coupon.start_date || now > coupon.expiration_date) {
    throw new Error("Mã giảm giá đã hết hạn");
  }

  // Validate số lượng
  if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
    throw new Error("Mã giảm giá đã hết lượt sử dụng");
  }

  // Giá gốc (ưu tiên giá khuyến mãi của khóa học)
  const originalPrice =
    registration.course_id.discounted_price || registration.course_id.Tuition;

  // Validate đơn tối thiểu
  if (originalPrice < coupon.min_order_value) {
    throw new Error(
      `Đơn hàng phải từ ${coupon.min_order_value.toLocaleString()}đ mới được dùng mã này`
    );
  }

  // Tính toán số tiền giảm
  let discountAmount = 0;
  if (coupon.discount_type === "percent") {
    discountAmount = (originalPrice * coupon.discount_value) / 100;
    // Cap (trần) giảm tối đa
    if (
      coupon.max_discount_amount &&
      discountAmount > coupon.max_discount_amount
    ) {
      discountAmount = coupon.max_discount_amount;
    }
  } else if (coupon.discount_type === "fixed") {
    discountAmount = coupon.discount_value;
  }

  // Không giảm quá giá gốc
  if (discountAmount > originalPrice) discountAmount = originalPrice;
  const finalAmount = originalPrice - discountAmount;

  // Cập nhật DB
  registration.coupon_id = coupon._id;
  registration.discount_amount = discountAmount;
  registration.final_amount = finalAmount;

  await registration.save();

  return {
    message: "Áp dụng mã thành công",
    discountAmount,
    finalAmount,
    couponCode: coupon.code,
  };
};
