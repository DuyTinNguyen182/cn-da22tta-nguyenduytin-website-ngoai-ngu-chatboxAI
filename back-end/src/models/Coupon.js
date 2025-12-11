// models/Coupon.js
const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true }, // Mã code (VD: SALE50)
    description: { type: String }, // Mô tả mã
    discount_type: {
      type: String,
      enum: ["percent", "fixed"], // percent: giảm %, fixed: giảm tiền mặt
      required: true,
    },
    discount_value: { type: Number, required: true }, // Giá trị giảm (VD: 10 hoặc 50000)
    min_order_value: { type: Number, default: 0 }, // Giá trị đơn hàng tối thiểu để áp dụng
    max_discount_amount: { type: Number, default: null }, // Giảm tối đa bao nhiêu (cho loại percent)
    start_date: { type: Date, default: Date.now },
    expiration_date: { type: Date, required: true }, // Ngày hết hạn
    usage_limit: { type: Number, default: null }, // Giới hạn số lần dùng mã này (toàn hệ thống)
    usage_count: { type: Number, default: 0 }, // Đã dùng bao nhiêu lần
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", CouponSchema);
