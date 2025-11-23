import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spin, message, Descriptions, Tag, Flex, Rate } from "antd";
import {
  EyeOutlined,
  UsergroupAddOutlined,
  StarFilled,
} from "@ant-design/icons";
import apiClient from "../../../api/axiosConfig";
import { useAuth } from "../../../context/AuthContext";
import "./CourseDetail.css";
import ReviewList from "../../../components/ReviewList/ReviewList";
import ReviewForm from "../../../components/ReviewForm/ReviewForm";

function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userHasPaid, setUserHasPaid] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  const { state } = useAuth();
  const { currentUser } = state;
  const userId = currentUser?._id;

  const fetchPageData = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseRes, reviewRes] = await Promise.all([
        apiClient.get(`/course/${courseId}`),
        apiClient.get(`/review/course/${courseId}`),
      ]);

      setCourse(courseRes.data);
      setReviews(reviewRes.data);

      // Kiểm tra xem user đã đánh giá khóa học này chưa
      if (
        userId &&
        reviewRes.data.some((review) => review.user_id?._id === userId)
      ) {
        setUserHasReviewed(true);
      }

      // Gửi request tăng lượt xem
      apiClient.patch(`/course/${courseId}/view`);

      // Nếu user đã đăng nhập, kiểm tra xem đã thanh toán khóa học này chưa
      if (userId) {
        const userRegistrations = await apiClient.get(
          `/registration/user/${userId}`
        );
        const hasPaid = userRegistrations.data.some(
          (reg) => reg.course_id?._id === courseId && reg.isPaid
        );
        setUserHasPaid(hasPaid);
      }
    } catch (error) {
      messageApi.error("Không thể tải dữ liệu trang.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, [courseId, userId]);

  const handleCreateReview = async (values) => {
    setIsSubmittingReview(true);
    try {
      await apiClient.post("/review", {
        course_id: courseId,
        ...values,
      });
      messageApi.success("Gửi đánh giá thành công!");
      setIsReviewFormVisible(false);
      fetchPageData();
    } catch (error) {
      messageApi.error(
        error.response?.data?.message || "Gửi đánh giá thất bại."
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

  // const handleGoBack = () => navigate(-1);

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

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, review) => acc + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  if (loading) return <Spin fullscreen tip="Đang tải..." />;
  if (!course) return <div>Không tìm thấy thông tin khóa học.</div>;

  const languageName = course.language_id?.language;
  const levelName = course.languagelevel_id?.language_level;
  const teacherName = course.teacher_id?.full_name;

  const canWriteReview =
    !userHasReviewed && (userHasPaid || currentUser?.role === "Admin"); 

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
            Khóa học {languageName} - {levelName}
            <br/>Mã KH: {course.courseid}
          </h1>
          <p className="course-teacher">
            Giảng viên: <strong>{teacherName || "Đang cập nhật"}</strong>
          </p>
          <div className="course-rating">
            <span className="average-rating-number">{averageRating}</span>
            <Rate disabled allowHalf value={parseFloat(averageRating)} />
            <span className="total-reviews">({reviews.length} đánh giá)</span>
          </div>
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
          <div className="reviews-section">
            <div className="reviews-header">
              <h2>Đánh giá từ học viên</h2>
              {canWriteReview && (
                <Button
                  type="primary"
                  onClick={() => setIsReviewFormVisible(true)}
                >
                  Viết đánh giá
                </Button>
              )}
            </div>
            <ReviewList reviews={reviews} />
          </div>
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
            disabled={
              course.status === "finished" || course.status === "ongoing"
            } // Không cho đăng ký nếu khóa học đã kết thúc
          >
            {course.status === "finished" || course.status === "ongoing"
              ? "Ngoài thời gian đăng ký"
              : "Đăng ký ngay"}
          </Button>
        </div>
      </div>
      <ReviewForm
        open={isReviewFormVisible}
        onCreate={handleCreateReview}
        onCancel={() => setIsReviewFormVisible(false)}
        loading={isSubmittingReview}
      />
    </div>
  );
}

export default CourseDetailPage;
