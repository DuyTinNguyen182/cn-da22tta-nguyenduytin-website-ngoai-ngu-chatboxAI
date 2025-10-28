import React from 'react';
import { Button, Card, Tag } from "antd";
import './RegisteredCourseCard.css';

const RegisteredCourseCard = ({ registration, onUnregister, onPayment }) => {
  const { course_id: course, isPaid, _id: registrationId } = registration;

  if (!course || !course.language_id || !course.languagelevel_id) {
    return (
      <Card title="Dữ liệu không đầy đủ">
        Không thể hiển thị thông tin khóa học.
      </Card>
    );
  }

  return (
    <Card
      className="registered-course-card"
      title={
        <div className="card-title">
          {course.language_id.language} - {course.languagelevel_id.language_level}
          <Tag color={isPaid ? "green" : "orange"} style={{ marginLeft: 10 }}>
            {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
          </Tag>
        </div>
      }
    >
      <p><b>Ngày bắt đầu:</b> {new Date(course.Start_Date).toLocaleDateString("vi-VN")}</p>
      <p><b>Số buổi:</b> {course.Number_of_periods}</p>
      <p><b>Học phí:</b> {course.Tuition.toLocaleString()} VND</p>
      <p><b>Giảng viên:</b> {course.teacher_id?.full_name ?? "Không rõ"}</p>
      <p><b>Mô tả:</b> {course.Description ?? "Không có mô tả"}</p>
      <p><b>Ngày đăng ký:</b> {new Date(registration.enrollment_date).toLocaleDateString("vi-VN")}</p>
      
      <div className="card-actions">
        <Button
          danger
          onClick={() => onUnregister(registrationId)}
          disabled={isPaid}
        >
          Hủy
        </Button>
        <Button
          type="primary"
          disabled={isPaid}
          onClick={() => onPayment(registrationId, course.Tuition)}
        >
          {isPaid ? "Đã thanh toán" : "Thanh toán"}
        </Button>
      </div>
    </Card>
  );
};

export default RegisteredCourseCard;