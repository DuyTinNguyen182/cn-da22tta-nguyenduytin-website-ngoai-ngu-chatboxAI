import React from "react";
import { Button, Tag } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  StopOutlined,
  CloseCircleOutlined,
  FlagOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import courseImagePlaceholder from "../../imgs/image.png";

const RegisteredCourseCard = ({ registration, onUnregister, onPayment }) => {
  const navigate = useNavigate();

  const {
    course_id: course,
    isPaid,
    _id: registrationId,
    status,
    class_session_id: session,
  } = registration;

  if (!course || !course.language_id || !course.languagelevel_id) {
    return null;
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

  const renderStatusBadge = () => {
    if (status === "confirmed")
      return (
        <Tag
          color="success"
          className="m-0 border-0 bg-green-100 text-green-700 font-medium"
        >
          Đã mở lớp
        </Tag>
      );
    if (status === "cancelled")
      return (
        <Tag
          color="error"
          className="m-0 border-0 bg-red-100 text-red-700 font-medium"
        >
          Đã hủy
        </Tag>
      );
    if (status === "cancelled_overdue")
      return (
        <Tag className="m-0 border-0 bg-gray-200 text-gray-600 font-medium">
          Hủy tự động (Quá hạn thanh toán)
        </Tag>
      );
    return (
      <Tag
        color="processing"
        className="m-0 border-0 bg-blue-100 text-blue-700 font-medium"
      >
        Chờ xếp lớp
      </Tag>
    );
  };

  return (
    <div
      className={`group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-5 ${
        status === "cancelled_overdue" ? "opacity-60 bg-gray-50" : ""
      }`}
    >
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
          {status !== "cancelled_overdue" &&
            (isPaid ? (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                ĐÃ THANH TOÁN
              </span>
            ) : (
              <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                CHỜ THANH TOÁN
              </span>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xl text-gray-800 font-bold font-mono uppercase bg-gray-50 px-2 py-0.5 rounded">
            {course.courseid}
          </span>
          {renderStatusBadge()}
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
              Giảng viên: {course.teacher_id?.full_name ?? "Đang cập nhật"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-blue-500" />
            <span>Khai giảng: {formatDate(course.Start_Date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FlagOutlined className="text-gray-400" />
            <span>Kết thúc: {formatDate(course.end_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockCircleOutlined className="text-gray-400" />
            <span className="truncate font-medium text-gray-700">
              {session ? `${session.days} (${session.time})` : "Chưa có lịch"}
            </span>
          </div>
        </div>
        <div className="mt-auto">
          {status === "cancelled" && (
            <div className="text-sm flex items-start gap-2 rounded bg-red-50 text-red-700">
              <StopOutlined className="mt-0.5" />
              <span className="font-medium">
                Lớp học bị hủy. Trung tâm sẽ hoàn tiền học phí (nếu có) trong 02
                ngày làm việc.
              </span>
            </div>
          )}

          {status === "cancelled_overdue" && (
            <div className="text-sm flex items-start gap-2 rounded bg-gray-100 text-gray-600">
              <CloseCircleOutlined className="mt-0.5" />
              <span className="font-medium">
                Lớp học đã bị hủy tự động do quá hạn thanh toán.
              </span>
            </div>
          )}

          {!isPaid && status === "pending" && !status.includes("cancelled") && (
            <div
              className={`text-sm flex items-start gap-2 rounded ${
                isOverdue
                  ? "bg-red-50 text-red-600"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <ExclamationCircleOutlined />
              <span className="font-medium">
                {isOverdue
                  ? "Đã quá hạn thanh toán. Vui lòng liên hệ trung tâm để được hỗ trợ."
                  : `Vui lòng thanh toán trước ngày ${formatDate(
                      paymentDeadline.toISOString()
                    )}`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-48 md:border-l border-gray-100 md:pl-5 flex flex-col justify-center items-end md:items-end gap-1 pt-4 md:pt-0 border-t md:border-t-0">
        <div className="text-right mb-4">
          {course.discount_percent > 0 && (
            <div className="text-xs text-gray-400 line-through">
              {course.Tuition?.toLocaleString()}₫
            </div>
          )}
          <div className="text-xl font-bold text-red-600">
            {course.discounted_price?.toLocaleString()}₫
          </div>
          {course.discount_percent > 0 && (
            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded font-bold">
              -{course.discount_percent}%
            </span>
          )}
        </div>

        <div className="w-full flex flex-row md:flex-col gap-2">
          {status === "cancelled" || status === "cancelled_overdue" ? (
            <Button
              danger
              block
              onClick={(e) => {
                e.stopPropagation();
                onUnregister(registrationId);
              }}
            >
              Xóa
            </Button>
          ) : !isPaid ? (
            <>
              <Button
                type="primary"
                danger={isOverdue}
                disabled={isOverdue}
                className={`${!isOverdue ? "bg-blue-600" : ""} font-semibold`}
                block
                icon={<DollarOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isOverdue) onPayment(registrationId, course.Tuition);
                }}
              >
                Thanh toán
              </Button>
              <Button
                danger
                type="default"
                block
                size="small"
                className="border-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnregister(registrationId);
                }}
              >
                Hủy đăng ký
              </Button>
            </>
          ) : (
            <Button
              block
              type="default"
              className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
              onClick={handleNavigate}
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
