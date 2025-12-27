import { useEffect, useState } from "react";
import { Tag, message } from "antd";
import {
  CopyOutlined,
  GiftOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import apiClient from "../../api/axiosConfig";

const CouponTicker = ({ isVisible }) => {
  const [coupons, setCoupons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await apiClient.get("/coupon/available");
        const activeCoupons = res.data.filter((c) => c.isActive);
        setCoupons(activeCoupons);
      } catch (error) {
        console.error("Lỗi lấy mã giảm giá:", error);
      }
    };
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (coupons.length <= 1) return;
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % coupons.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [coupons.length, isHovered]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    message.success(`Đã sao chép mã: ${code}`);
  };

  if (coupons.length === 0) return null;

  const currentCoupon = coupons[currentIndex];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        w-full 
        bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500
        text-white flex items-center justify-center 
        transition-all duration-500 ease-in-out overflow-hidden
        absolute top-[55px] left-0 -z-10 shadow-md cursor-default border-b border-white/20
        ${isVisible ? "py-2" : "py-0"}
      `}
      style={{
        height: isVisible ? "auto" : "0px",
        minHeight: isVisible ? "46px" : "0px",
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        key={currentIndex}
        className="w-full max-w-7xl px-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm md:text-[15px] animate-in fade-in slide-in-from-bottom-2 duration-500 leading-snug text-center"
      >
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white/20 p-1 rounded-full animate-bounce">
            <GiftOutlined className="text-yellow-300 text-lg" />
          </div>
          <span className="font-bold text-yellow-50 drop-shadow-sm uppercase tracking-wide hidden sm:inline">
            Ưu đãi Hot:
          </span>
        </div>

        <span className="font-extrabold text-yellow-300 text-lg drop-shadow-md shrink-0">
          {currentCoupon.discount_type === "percent"
            ? `Giảm ${currentCoupon.discount_value}%`
            : `Giảm ${currentCoupon.discount_value / 1000}k`}
        </span>

        <span className="text-white/60 hidden sm:inline">|</span>

        <span className="font-medium text-white break-words">
          {currentCoupon.description}
        </span>

        <span className="text-white/60 hidden md:inline">|</span>

        <div className="flex items-center gap-1 text-cyan-50 bg-white/10 px-2 py-0.5 rounded-md text-xs sm:text-sm shrink-0">
          <ClockCircleOutlined />
          <span>
            {formatDate(currentCoupon.start_date)} -{" "}
            {formatDate(currentCoupon.expiration_date)}
          </span>
        </div>

        <div
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-3 py-1 rounded-full cursor-pointer transition-all font-bold shadow-sm active:scale-95 shrink-0 ml-1"
          onClick={() => handleCopy(currentCoupon.code)}
          title="Nhấn để sao chép"
        >
          <span className="font-mono tracking-wider">{currentCoupon.code}</span>
          <CopyOutlined />
        </div>
      </div>
    </div>
  );
};

export default CouponTicker;
