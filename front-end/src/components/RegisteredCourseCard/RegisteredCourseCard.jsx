import React from "react";
import { Button, Tag, Tooltip } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  StopOutlined,
  FlagOutlined,
  ShopOutlined,
  CreditCardOutlined,
  TagOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import courseImagePlaceholder from "../../imgs/image.png";

const RegisteredCourseCard = ({ registration, onUnregister }) => {
  const navigate = useNavigate();

  const {
    course_id: course,
    isPaid,
    _id: registrationId,
    status,
    class_session_id: session,
    final_amount,
    payment_method,
    coupon_id,
  } = registration;

  if (!course || !course.language_id || !course.languagelevel_id) {
    return null;
  }

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString("vi-VN") : "---";

  const handleNavigate = () => {
    navigate(`/courses/${course._id}`);
  };

  const imageUrl = course.image || courseImagePlaceholder;

  const displayPrice =
    final_amount ?? course.discounted_price ?? course.Tuition;
  const originalPrice = course.Tuition;
  const hasDiscount = displayPrice < originalPrice;

  const renderStatusBadge = () => {
    if (status === "confirmed") return <Tag color="success">Đã mở lớp</Tag>;
    if (status === "cancelled") return <Tag color="error">Đã hủy</Tag>;
    return <Tag color="processing">Chờ xếp lớp</Tag>;
  };

  const renderPaymentMethod = () => {
    if (payment_method === "cash") {
      return (
        <span className="flex items-center gap-1 text-gray-600">
          <ShopOutlined className="text-orange-500" /> Tiền mặt
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-gray-600">
        <CreditCardOutlined className="text-blue-500" /> VNPay
      </span>
    );
  };

  return (
    <div className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-5 relative overflow-hidden">
      <div
        className="w-full md:w-64 h-48 md:h-auto shrink-0 rounded-lg overflow-hidden cursor-pointer relative bg-gray-100"
        onClick={handleNavigate}
      >
        <img
          src={imageUrl}
          alt={course.language_id.language}
          onError={(e) => {
            e.target.src = courseImagePlaceholder;
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2">
          {isPaid ? (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              ĐÃ THANH TOÁN
            </span>
          ) : (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              CHỜ THANH TOÁN
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xl text-gray-800 font-bold font-mono uppercase bg-gray-50 px-2 py-0.5 rounded">
            {course.courseid}
          </span>
          <div className="flex gap-2">{renderStatusBadge()}</div>
        </div>

        <h3
          className="text-lg font-bold text-gray-800 hover:text-blue-600 cursor-pointer mb-3 transition-colors"
          onClick={handleNavigate}
        >
          {course.language_id.language} -{" "}
          {course.languagelevel_id.language_level}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            <span className="truncate max-w-[150px]">
              GV: {course.teacher_id?.full_name ?? "Đang cập nhật"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-blue-500" />
            <span>KG: {formatDate(course.Start_Date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockCircleOutlined className="text-gray-400" />
            <span className="truncate font-medium text-gray-700">
              {session ? `${session.days} (${session.time})` : "Chưa có lịch"}
            </span>
          </div>

          <div
            className="flex items-center gap-2"
            title="Phương thức thanh toán"
          >
            {renderPaymentMethod()}
          </div>
        </div>

        <div className="mt-auto">
          {status === "cancelled" && (
            <div className="text-sm flex items-start gap-2 rounded bg-red-50 text-red-700 p-2">
              <StopOutlined className="mt-0.5" />
              <span className="font-medium">
                Lớp học bị hủy. Vui lòng liên hệ trung tâm để được hỗ trợ hoàn
                phí.
              </span>
            </div>
          )}

          {!isPaid && payment_method === "cash" && status !== "cancelled" && (
            <div className="text-sm flex items-start gap-2 rounded bg-orange-50 text-orange-700 p-2 border border-orange-100">
              <InfoCircleOutlined className="mt-0.5" />
              <span>Vui lòng đến trung tâm hoàn tất học phí để giữ chỗ.</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-48 md:border-l border-gray-100 md:pl-5 flex flex-col justify-center items-end md:items-end gap-1 pt-4 md:pt-0 border-t md:border-t-0">
        <div className="text-right mb-4">
          {hasDiscount && (
            <div className="text-xs text-gray-400 line-through">
              {originalPrice?.toLocaleString()}₫
            </div>
          )}
          <div className="text-xl font-bold text-red-600">
            {displayPrice?.toLocaleString()}₫
          </div>
          {coupon_id && (
            <Tag
              color="cyan"
              className="mt-1 mr-0 flex items-center gap-1 border-0 bg-cyan-50 text-cyan-700"
            >
              <TagOutlined /> Đã áp dụng mã
            </Tag>
          )}
        </div>

        <div className="w-full flex flex-row md:flex-col gap-2">
          {status === "cancelled" ? (
            <Button
              danger
              block
              onClick={(e) => {
                e.stopPropagation();
                onUnregister(registrationId);
              }}
            >
              Xóa đơn
            </Button>
          ) : (
            <Button
              block
              type="default"
              className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 font-medium"
              onClick={handleNavigate}
            >
              Xem chi tiết
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisteredCourseCard;
