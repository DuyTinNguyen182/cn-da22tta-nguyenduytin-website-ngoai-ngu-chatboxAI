// src/components/CourseCard/CourseCard.jsx

import React from 'react';
import './CourseCard.css';

const CourseCard = ({ course, onDetailClick, onRegisterClick }) => {
  return (
    <div className="course-card">
      <div className="top-half">
        <div className="language">
          KHÓA HỌC {course.language?.toUpperCase() || "CHƯA RÕ"}
        </div>
        <div className="level">
          {course.languagelevel?.toUpperCase() || "CHƯA RÕ"}
        </div>
      </div>

      <div className="bottom-half">
        <div className="course-description">
          <div>
            <ion-icon name="caret-forward-outline"></ion-icon> Ngày bắt
            đầu:{" "}
            {new Date(course.Start_Date).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <ion-icon name="pie-chart"></ion-icon> Số tiết:{" "}
            {course.Number_of_periods}
          </div>
          <div>
            <ion-icon name="cash"></ion-icon> Học phí:{" "}
            {course.Tuition?.toLocaleString()} đ
          </div>
          <div>
            <ion-icon name="person"></ion-icon> Giảng viên:{" "}
            {course.teacher_name || "Đang cập nhật"}
          </div>
        </div>
        <div className="action-buttons">
          <button
            className="properties-course"
            onClick={() => onDetailClick(course)}
          >
            Chi tiết
          </button>
          <button
            className="sign-up-course"
            onClick={() => onRegisterClick(course.id)}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;