import React from "react";
import "./CourseCard.css";
import { Link } from 'react-router-dom';

const CourseCard = ({ course, onRegisterClick }) => {
  if (!course) {
    return null;
  }

  const languageName = course.language_id?.language;
  const levelName = course.languagelevel_id?.language_level;
  const teacherName = course.teacher_id?.full_name;

  return (
    <div className="course-card">
      <div className="top-half">
        <div className="language">
          KHÓA HỌC {languageName?.toUpperCase() || "CHƯA RÕ"}
        </div>
        <div className="level">{levelName?.toUpperCase() || "CHƯA RÕ"}</div>
      </div>

      <div className="bottom-half">
        <div className="course-description">
          <div>
            <ion-icon name="caret-forward-outline"></ion-icon> Ngày bắt đầu:{" "}
            {course.Start_Date
              ? new Date(course.Start_Date).toLocaleDateString("vi-VN")
              : "N/A"}
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
            {teacherName || "Đang cập nhật"}
          </div>
        </div>
        <div className="action-buttons">
          <Link
            to={`/courses/${course._id}`}
            className="properties-course-link"
          >
            Chi tiết
          </Link>
          <button
            className="sign-up-course"
            onClick={() => onRegisterClick(course._id)}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
