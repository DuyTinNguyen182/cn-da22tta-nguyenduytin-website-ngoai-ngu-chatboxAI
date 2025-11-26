import React from "react";
import { Button, Tag } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  BarcodeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import courseImagePlaceholder from "../../imgs/image.png";

const RegisteredCourseCard = ({ registration, onUnregister, onPayment }) => {
  const navigate = useNavigate();

  const {
    course_id: course,
    isPaid,
    _id: registrationId,
    enrollment_date,
    paymentDate,
  } = registration;

  if (!course || !course.language_id || !course.languagelevel_id) {
    return (
      <div className="p-4 border border-dashed border-red-300 bg-red-50 text-red-500 rounded-lg text-center mb-4">
        Dữ liệu khóa học không khả dụng.
      </div>
    );
  }

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString("vi-VN") : "";

  const handleNavigate = () => {
    navigate(`/courses/${course._id}`);
  };

  const imageUrl = course.image || courseImagePlaceholder;

  return (
    <div className="group flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300">
      <div
        className="relative w-full md:w-60 lg:w-64 shrink-0 cursor-pointer overflow-hidden aspect-video md:aspect-[4/3] bg-white"
        onClick={handleNavigate}
      >
        <img
          src={imageUrl}
          alt={course.language_id.language}
          onError={(e) => {
            e.target.src = courseImagePlaceholder;
          }}
          className="w-full h-full object-contain bg-white"
          style={{ padding: "8px" }}
        />
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div> */}
        <div className="absolute top-3 left-3 z-10">
          {isPaid ? (
            <Tag
              color="#10b981"
              icon={<CheckCircleOutlined />}
              className="!border-0 !text-sm !py-0.5 !px-2 font-bold shadow-sm"
            >
              Đã thanh toán
            </Tag>
          ) : (
            <Tag
              color="#f59e0b"
              icon={<ClockCircleOutlined />}
              className="!border-0 !text-sm !py-0.5 !px-2 font-bold shadow-sm"
            >
              Chờ thanh toán
            </Tag>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-5 md:px-6 md:py-4">
        <div
          className="flex flex-col md:flex-row justify-between items-start gap-3 mb-1 cursor-pointer"
          onClick={handleNavigate}
        >
          <div>
            <h3 className="text-lg md:text-xl font-extrabold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">
              {course.language_id.language} -{" "}
              {course.languagelevel_id.language_level}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 bg-slate-100 border border-slate-200 w-fit px-2 py-1 rounded-md">
              <BarcodeOutlined className="text-slate-500" /> Mã KH:{" "}
              <span className="font-mono font-bold text-slate-800">
                {course.courseid}
              </span>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-0 shrink-0 mt-1 md:mt-0">
            <div className="text-lg md:text-2xl font-extrabold text-red-600">
              {course.discounted_price?.toLocaleString()}₫
            </div>
            {course.discount_percent > 0 && (
              <div className="text-sm text-gray-400 line-through font-medium">
                {course.Tuition?.toLocaleString()}₫
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 text-[15px] text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            <span>
              Giảng viên:{" "}
              <strong className="text-gray-800 font-semibold">
                {course.teacher_id?.full_name ?? "Đang cập nhật"}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockCircleOutlined className="text-blue-500" />
            <span>
              Thời lượng:{" "}
              <span className="font-medium text-gray-800">
                {course.Number_of_periods} tiết
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-blue-500" />
            <span>Ngày đăng ký: {formatDate(enrollment_date)}</span>
          </div>

          {isPaid && paymentDate && (
            <div className="mt-1 inline-flex items-center gap-2 bg-green-100/80 text-green-800 px-3 py-1.5 rounded-md font-medium text-sm w-fit">
              <CheckCircleOutlined />
              <span>
                Thanh toán lúc: <strong>{formatDate(paymentDate)}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap justify-end gap-3">
          {!isPaid ? (
            <>
              <Button
                danger
                size="large"
                className="hover:!bg-red-50 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnregister(registrationId);
                }}
              >
                Hủy đăng ký
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<DollarOutlined />}
                className="bg-blue-600 hover:!bg-blue-500 shadow-md shadow-blue-200 font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  onPayment(registrationId, course.Tuition);
                }}
              >
                Thanh toán ngay
              </Button>
            </>
          ) : (
            <Button
              size="large"
              onClick={handleNavigate}
              className="border-blue-600 text-blue-600 hover:!bg-blue-50 hover:!text-blue-700 font-bold px-6"
            >
              Xem lại & đánh giá
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisteredCourseCard;
