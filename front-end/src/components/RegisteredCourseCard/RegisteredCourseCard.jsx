import React from "react";
import { Button, Tag } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  BarcodeOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  ScheduleOutlined,
  CloseCircleOutlined,
  FlagOutlined,
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
    status,
    class_session_id: session,
  } = registration;

  if (!course || !course.language_id || !course.languagelevel_id) {
    return (
      <div className="p-4 border border-dashed border-red-300 bg-red-50 text-red-500 rounded-lg text-center mb-4">
        Dữ liệu khóa học không khả dụng.
      </div>
    );
  }

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString("vi-VN") : "---";

  const startDate = new Date(course.Start_Date);
  const paymentDeadline = new Date(startDate);
  paymentDeadline.setDate(startDate.getDate() - 2);
  const isOverdue = new Date() > paymentDeadline;

  const handleNavigate = () => {
    navigate(`/courses/${course._id}`);
  };

  const imageUrl = course.image || courseImagePlaceholder;

  const renderClassStatus = () => {
    if (status === "confirmed")
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Đã mở lớp
        </Tag>
      );
    if (status === "cancelled")
      return (
        <Tag color="error" icon={<StopOutlined />}>
          Lớp đã hủy (Admin)
        </Tag>
      );
    if (status === "cancelled_overdue")
      return (
        <Tag color="default" icon={<CloseCircleOutlined />}>
          Tự động hủy
        </Tag>
      );
    return (
      <Tag color="processing" icon={<ClockCircleOutlined />}>
        Chờ xếp lớp
      </Tag>
    );
  };

  return (
    <div
      className={`group flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 ${
        status === "cancelled_overdue"
          ? "opacity-70 border-gray-200 bg-gray-50"
          : "border-gray-200"
      }`}
    >
      <div
        className="relative w-full md:w-64 lg:w-72 shrink-0 cursor-pointer overflow-hidden bg-white border-r border-gray-100"
        style={{ height: "170px" }}
        onClick={handleNavigate}
      >
        <img
          src={imageUrl}
          alt={course.language_id.language}
          onError={(e) => {
            e.target.src = courseImagePlaceholder;
          }}
          className={`w-full h-full object-cover ${
            status === "cancelled_overdue" ? "grayscale" : ""
          }`}
        />
        <div className="absolute top-3 left-3 z-10">
          {status !== "cancelled_overdue" &&
            (isPaid ? (
              <Tag
                color="#10b981"
                icon={<CheckCircleOutlined />}
                className="!border-0 !text-xs !font-bold shadow-sm"
              >
                Đã thanh toán
              </Tag>
            ) : (
              <Tag
                color="#f59e0b"
                icon={<ClockCircleOutlined />}
                className="!border-0 !text-xs !font-bold shadow-sm"
              >
                Chờ thanh toán
              </Tag>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 md:p-5">
        <div className="flex flex-col xl:flex-row justify-between items-start gap-1 mb-3">
          <div className="flex-1">
            <h3
              className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors cursor-pointer leading-snug mb-2"
              onClick={handleNavigate}
            >
              {course.language_id.language} -{" "}
              {course.languagelevel_id.language_level}
            </h3>
            <div className="flex items-center gap-2 mb-1">
              {renderClassStatus()}
              <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                <BarcodeOutlined /> {course.courseid}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-red-600">
              {course.discounted_price?.toLocaleString()}₫
            </div>
            {course.discount_percent > 0 && (
              <div className="text-xs text-gray-400 line-through">
                {course.Tuition?.toLocaleString()}₫
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <UserOutlined className="text-blue-500 shrink-0" />
              <span className="truncate">
                GV:{" "}
                <strong>
                  {course.teacher_id?.full_name ?? "Đang cập nhật"}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ScheduleOutlined className="text-blue-500 shrink-0" />
              <span className="truncate">
                Lịch:{" "}
                <strong>
                  {session ? `${session.days} (${session.time})` : "Chưa xếp"}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-blue-500 shrink-0" />
              <span>
                Khai giảng: <strong>{formatDate(course.Start_Date)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FlagOutlined className="text-red-500 shrink-0" />
              <span>
                Kết thúc: <strong>{formatDate(course.end_date)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 lg:col-span-2">
              <ClockCircleOutlined className="text-blue-500 shrink-0" />
              <span>Thời lượng: {course.Number_of_periods} tiết</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end">
          {status === "cancelled" && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex gap-2 items-start">
              <StopOutlined className="mt-1" />
              <span>
                Lớp đã hủy. Trung tâm sẽ liên hệ hoàn tiền trong 02 ngày làm
                việc.
              </span>
            </div>
          )}

          {status === "cancelled_overdue" && (
            <div className="mb-3 p-2.5 bg-gray-100 border border-gray-300 rounded text-gray-600 text-sm flex gap-2 items-start">
              <CloseCircleOutlined className="mt-1" />
              <span>
                Đã hủy tự động do quá hạn thanh toán. Vui lòng đăng ký lại.
              </span>
            </div>
          )}

          {!isPaid && status === "pending" && (
            <div
              className={`mb-3 p-2.5 rounded text-sm flex gap-2 items-start border ${
                isOverdue
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              <ExclamationCircleOutlined className="mt-1" />
              <span>
                {isOverdue
                  ? "Đã quá hạn thanh toán."
                  : `Vui lòng thanh toán trước ngày ${formatDate(
                      paymentDeadline.toISOString()
                    )}.`}
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 flex flex-wrap justify-end gap-2.5">
          {status === "cancelled" || status === "cancelled_overdue" ? (
            <Button
              danger
              onClick={(e) => {
                e.stopPropagation();
                onUnregister(registrationId);
              }}
            >
              Xóa khỏi danh sách
            </Button>
          ) : !isPaid ? (
            <>
              <Button
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  onUnregister(registrationId);
                }}
              >
                Hủy đăng ký
              </Button>
              <Button
                type="primary"
                icon={<DollarOutlined />}
                disabled={isOverdue}
                className={`font-semibold shadow-sm ${
                  isOverdue ? "bg-gray-400" : "bg-blue-600 hover:!bg-blue-500"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isOverdue) onPayment(registrationId, course.Tuition);
                }}
              >
                {isOverdue ? "Hết hạn thanh toán" : "Thanh toán ngay"}
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckCircleOutlined /> Đã thanh toán: {formatDate(paymentDate)}
              </span>
              <Button
                onClick={handleNavigate}
                className="border-blue-600 text-blue-600 hover:!bg-blue-50 font-medium"
              >
                Vào nhóm zalo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisteredCourseCard;
