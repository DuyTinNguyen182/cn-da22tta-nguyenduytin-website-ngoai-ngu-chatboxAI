import React from "react";
import { Button, Tag, Typography } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./RegisteredCourseCard.css";
import courseImagePlaceholder from "../../imgs/image.png";

const { Title, Text } = Typography;

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
      <div className="course-card-error">Dữ liệu khóa học không khả dụng.</div>
    );
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString("vi-VN") : "";

  const handleNavigate = () => {
    navigate(`/courses/${course._id}`);
  };

  return (
    <div className="registered-course-card-horizontal">
      <div className="card-left" onClick={handleNavigate}>
        <img
          src={course.image || courseImagePlaceholder}
          alt={course.language_id.language}
          className="course-img"
        />
        <div className="card-status-tag">
          {isPaid ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Đã thanh toán
            </Tag>
          ) : (
            <Tag color="warning" icon={<ClockCircleOutlined />}>
              Chờ thanh toán
            </Tag>
          )}
        </div>
      </div>

      <div className="card-right">
        <div className="card-info" onClick={handleNavigate}>
          <div className="info-header">
            <Title level={5} className="course-name">
              {course.language_id.language} -{" "}
              {course.languagelevel_id.language_level}
              <br /> KH: {course.courseid}
            </Title>
            <div className="price-wrapper">
              <div className="current-price1">
                {course.discounted_price?.toLocaleString()} VNĐ
              </div>

              {course.discount_percent > 0 && (
                <div className="original-price1">
                  {course.Tuition?.toLocaleString()} VNĐ
                </div>
              )}
            </div>
          </div>

          <div className="info-details">
            <p>
              <UserOutlined /> Giảng viên:{" "}
              <strong>{course.teacher_id?.full_name ?? "Đang cập nhật"}</strong>
            </p>
            <p>
              <ClockCircleOutlined /> Số buổi: {course.Number_of_periods}
            </p>
            <p>
              <CalendarOutlined /> Ngày đăng ký: {formatDate(enrollment_date)}
            </p>

            {isPaid && paymentDate && (
              <p className="payment-date-highlight">
                <CheckCircleOutlined /> Ngày thanh toán:{" "}
                <strong>{formatDate(paymentDate)}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="card-footer-actions">
          {!isPaid ? (
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
                onClick={(e) => {
                  e.stopPropagation();
                  onPayment(registrationId, course.Tuition);
                }}
              >
                Thanh toán ngay
              </Button>
            </>
          ) : (
            <Button type="primary" ghost onClick={handleNavigate}>
              Xem chi tiết
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisteredCourseCard;
