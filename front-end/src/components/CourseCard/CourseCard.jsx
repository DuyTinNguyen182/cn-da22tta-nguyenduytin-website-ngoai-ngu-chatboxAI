import React from "react";
import { Link } from "react-router-dom";
import { EyeOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import courseImagePlaceholder from "../../imgs/image.png";

const CourseCard = ({ course }) => {
  if (!course) return null;

  const {
    _id,
    courseid,
    image,
    status,
    discount_percent,
    Tuition: oldPrice,
    discounted_price: newPrice,
    views,
    registration_count,
    language_id,
    languagelevel_id,
    teacher_id,
  } = course;

  const languageName = language_id?.language;
  const levelName = languagelevel_id?.language_level;
  const teacherName = teacher_id?.full_name;

  const renderStatusBadge = () => {
    const badgeStyles =
      "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md z-10 backdrop-blur-sm";

    switch (status) {
      case "upcoming":
        return (
          <span className={`${badgeStyles} bg-blue-500/90`}>Sắp diễn ra</span>
        );
      case "ongoing":
        return (
          <span className={`${badgeStyles} bg-emerald-500/90`}>
            Đang diễn ra
          </span>
        );
      case "finished":
        return (
          <span className={`${badgeStyles} bg-gray-500/90`}>Đã kết thúc</span>
        );
      default:
        return null;
    }
  };

  return (
    <Link to={`/courses/${_id}`} className="group h-full">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1">
        <div className="relative w-full pt-[56.25%] bg-gray-50 overflow-hidden">
          <img
            src={image || courseImagePlaceholder}
            alt={`${languageName} - ${levelName}`}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {renderStatusBadge()}

          {discount_percent > 0 && (
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-bl-lg shadow-sm z-10">
              -{discount_percent}%
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-[16px] font-bold text-gray-800 mb-1 leading-snug line-clamp-2 min-h-[44px] group-hover:text-blue-600 transition-colors">
            {languageName} - {levelName}{" "}
            <span className="text-gray-400 font-normal text-sm">
              ({courseid})
            </span>
          </h3>

          <div className="text-sm font-medium text-blue-600 mb-3 flex items-center gap-1">
            <ion-icon name="person-circle"></ion-icon>
            <span>GV: {teacherName}</span>
          </div>

          <div className="flex items-end gap-2 mb-4 mt-auto">
            <span className="text-lg font-bold text-red-600">
              {newPrice?.toLocaleString()}₫
            </span>
            {discount_percent > 0 && (
              <span className="text-sm text-gray-400 line-through mb-0.5">
                {oldPrice?.toLocaleString()}₫
              </span>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <EyeOutlined className="text-gray-400" />
              <span>{views || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UsergroupAddOutlined className="text-gray-400" />
              <span>{registration_count || 0} học viên</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
