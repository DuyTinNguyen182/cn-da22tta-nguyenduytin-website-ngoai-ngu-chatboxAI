import React from 'react';
import './CourseCard.css';
import { Link } from 'react-router-dom';
import { EyeOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Tag } from 'antd';

import courseImagePlaceholder from '../../imgs/images.jpg'; 

const CourseCard = ({ course }) => {
  if (!course) {
    return null;
  }

  const languageName = course.language_id?.language;
  const levelName = course.languagelevel_id?.language_level;
  const courseIdCode = course.courseid;

  const newPrice = course.discounted_price;
  const oldPrice = course.Tuition;
  const discountPercent = course.discount_percent;
  const views = course.views;
  const registeredCount = course.registration_count;
  const status = course.status;

  const getStatusTag = (status) => {
    switch (status) {
      case "upcoming":
        return <Tag color="blue">Sắp diễn ra</Tag>;
      case "ongoing":
        return <Tag color="green">Đang diễn ra</Tag>;
      case "finished":
        return <Tag color="default">Đã kết thúc</Tag>;
      default:
        return null;
    }
  };

  return (
    <Link to={`/courses/${course._id}`} className="course-card-link">
      <div className="course-card-new">
        <div className="course-image-container">
          <img src={course.image || courseImagePlaceholder} alt={`${languageName} - ${levelName}`} />
          {/* Hiển thị tag trạng thái trên ảnh */}
          <div className="status-tag-overlay">
            {getStatusTag(status)}
          </div>
          {discountPercent > 0 && (
            <div className="discount-badge">
              -{discountPercent}%
            </div>
          )}
        </div>
        <div className="course-info-container">
          <h3 className="course-title-new">
            {languageName} - {levelName} ({courseIdCode})
          </h3>
          <div className="course-price-container">
            {/* Hiển thị giá đã giảm và giá gốc */}
            <span className="new-price">{newPrice?.toLocaleString()}₫</span>
            {discountPercent > 0 && (
              <span className="old-price">{oldPrice?.toLocaleString()}₫</span>
            )}
          </div>
          <div className="course-stats-container">
            <span className="stat-item">
              <EyeOutlined /> {views || 0}
            </span>
            <span className="stat-item">
              <UsergroupAddOutlined /> {registeredCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;