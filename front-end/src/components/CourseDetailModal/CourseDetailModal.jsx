import React from "react";
import "./CourseDetailModal.css";

const CourseDetailModal = ({ course, onClose }) => {
  if (!course) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Thông tin khóa học</h2>

        <p><strong>Ngôn ngữ:</strong> {course.language || "Chưa rõ"}</p>
        <p><strong>Trình độ:</strong> {course.languagelevel || "Chưa rõ"}</p>
        <p>
          <strong>Ngày bắt đầu:</strong>{" "}
          {course.Start_Date
            ? new Date(course.Start_Date).toLocaleDateString("vi-VN")
            : "Chưa rõ"}
        </p>
        <p><strong>Số tiết:</strong> {course.Number_of_periods || "Chưa rõ"}</p>
        <p><strong>Giảng viên:</strong> {course.teacher_name || "Đang cập nhật"}</p>
        <p>
          <strong>Học phí:</strong>{" "}
          {course.Tuition
            ? course.Tuition.toLocaleString("vi-VN") + " VND"
            : "0 VND"}
        </p>
        <p><strong>Mô tả:</strong> {course.Description || "Không có mô tả"}</p>

        <button className="close-button" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default CourseDetailModal;
