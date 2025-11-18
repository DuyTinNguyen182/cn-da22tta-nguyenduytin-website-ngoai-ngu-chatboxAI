import React from "react";
import "./CourseCard.css";
import { Link } from "react-router-dom";
import { EyeOutlined, UsergroupAddOutlined } from "@ant-design/icons";

import courseImagePlaceholder from "../../imgs/avt.jpg";

const CourseCard = ({ course }) => {
  if (!course) {
    return null;
  }

  const languageName = course.language_id?.language;
  const levelName = course.languagelevel_id?.language_level;

  const oldPrice = course.Tuition ? course.Tuition + 1500000 : 0;
  const views = Math.floor(Math.random() * 2000) + 500;
  const registeredCount = Math.floor(Math.random() * 80) + 10;

  return (
    <Link to={`/courses/${course._id}`} className="course-card-link">
      <div className="course-card-new">
        <div className="course-image-container">
          <img
            src={course.image || courseImagePlaceholder}
            alt={`${languageName} - ${levelName}`}
          />
        </div>
        <div className="course-info-container">
          <h3 className="course-title-new">
            {languageName} - {levelName}
          </h3>
          <div className="course-price-container">
            <span className="new-price">
              {course.Tuition?.toLocaleString()}₫
            </span>
            <span className="old-price">
              {oldPrice > 0 ? oldPrice.toLocaleString() + "₫" : ""}
            </span>
          </div>
          <div className="course-stats-container">
            <span className="stat-item">
              <EyeOutlined /> {views}
            </span>
            <span className="stat-item">
              <UsergroupAddOutlined /> {registeredCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
