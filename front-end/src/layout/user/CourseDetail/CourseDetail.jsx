import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spin, message, Descriptions, Tag, Flex } from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import apiClient from "../../../api/axiosConfig";
import { useAuth } from "../../../context/AuthContext";
import "./CourseDetail.css";

function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  const { state } = useAuth();
  const { currentUser } = state;
  const userId = currentUser?._id;

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;
      setLoading(true);

      try {
        const res = await apiClient.get(`/course/${courseId}`);
        setCourse(res.data);

        apiClient.patch(`/course/${courseId}/view`);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  const handleRegister = async () => {
    if (!userId) {
      messageApi.error("Vui lòng đăng nhập để đăng ký khóa học!");
      return;
    }
    try {
      await apiClient.post("/registration", {
        user_id: userId,
        course_id: course._id,
      });
      messageApi.success("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => navigate(`/my-courses/${userId}`), 1000);
    } catch (error) {
      messageApi.error(error.response?.data?.message || "Đăng ký thất bại.");
    }
  };

  const handleGoBack = () => navigate(-1);

  const getStatusTag = (status) => {
    switch (status) {
      case "upcoming":
        return <Tag color="blue">Sắp diễn ra</Tag>;
      case "ongoing":
        return <Tag color="green">Đang diễn ra</Tag>;
      case "finished":
        return <Tag color="red">Đã kết thúc</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  if (loading) {
    return <Spin fullscreen tip="Đang tải chi tiết khóa học..." />;
  }

  if (!course) {
    return <div>Không tìm thấy thông tin khóa học.</div>;
  }

  const languageName = course.language_id?.language;
  const levelName = course.languagelevel_id?.language_level;
  const teacherName = course.teacher_id?.full_name;

  return (
    <div className="course-detail-page">
      {contextHolder}
      {/* <Button
        className="back-button"
        icon={<ArrowLeftOutlined />}
        onClick={handleGoBack}
      >
        Quay lại
      </Button> */}

      <div className="course-header">
        <img
          src={course.image}
          alt={languageName}
          className="course-main-image"
        />
        <div className="course-header-info">
          <h1 className="course-title">
            {languageName} - {levelName}
          </h1>
          <p className="course-teacher">
            Giảng viên: <strong>{teacherName || "Đang cập nhật"}</strong>
          </p>
          <div className="course-stats">
            <span>
              <EyeOutlined /> {course.views || 0} Lượt xem
            </span>
            <span>
              <UsergroupAddOutlined /> {course.registration_count || 0} Lượt
              đăng ký
            </span>
          </div>
        </div>
      </div>

      <div className="course-content-wrapper">
        <div className="course-description-panel">
          <h2>Mô tả khóa học</h2>
          <p>
            {course.Description ||
              "Hiện chưa có mô tả chi tiết cho khóa học này."}
          </p>
        </div>
        <div className="course-info-panel">
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(course.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {new Date(course.Start_Date).toLocaleDateString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">
              {new Date(course.end_date).toLocaleDateString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiết">
              {course.Number_of_periods}
            </Descriptions.Item>
            <Descriptions.Item label="Học phí">
              <div className="price-wrapper">
                <span className="current-price">
                  {course.discounted_price?.toLocaleString()} VNĐ
                </span>
                {course.discount_percent > 0 && (
                  <span className="original-price">
                    {course.Tuition?.toLocaleString()} VNĐ
                  </span>
                )}
              </div>
            </Descriptions.Item>
          </Descriptions>
          <Button
            type="primary"
            size="large"
            className="register-button"
            onClick={handleRegister}
            disabled={course.status === "finished" || course.status === "ongoing"} // Không cho đăng ký nếu khóa học đã kết thúc
          >
            {course.status === "finished" || course.status === "ongoing" ? "Ngoài thời gian đăng ký" : "Đăng ký ngay"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;
