import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spin, message, Tag, Rate, Modal } from "antd";
import {
  StarFilled,
  EyeOutlined,
  UsergroupAddOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import YouTube from "react-youtube";
import apiClient from "../../../api/axiosConfig";
import { useAuth } from "../../../context/AuthContext";
import ReviewList from "../../../components/ReviewList/ReviewList";
import ReviewForm from "../../../components/ReviewForm/ReviewForm";
import courseImagePlaceholder from "../../../imgs/image.png";

function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userHasPaid, setUserHasPaid] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
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

      if (
        userId &&
        reviewRes.data.some((review) => review.user_id?._id === userId)
      ) {
        setUserHasReviewed(true);
      }
      apiClient.patch(`/course/${courseId}/view`);

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
    if (course.status === "finished" || course.status === "ongoing") {
      messageApi.warning(
        "Khóa học đã kết thúc hoặc đang diễn ra, không thể đăng ký."
      );
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

  const getStatusTag = (status) => {
    const badgeStyles =
      "px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm uppercase";
    switch (status) {
      case "upcoming":
        return (
          <span className={`${badgeStyles} bg-blue-500`}>Sắp diễn ra</span>
        );
      case "ongoing":
        return (
          <span className={`${badgeStyles} bg-emerald-500`}>Đang diễn ra</span>
        );
      case "finished":
        return (
          <span className={`${badgeStyles} bg-gray-500`}>Đã kết thúc</span>
        );
      default:
        return <span className={`${badgeStyles} bg-gray-400`}>{status}</span>;
    }
  };

  const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const demoVideoId = getYouTubeID(course?.demo_video_url) || "DXj1TJLM1Mc";

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, review) => acc + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  if (loading) return <Spin fullscreen tip="Đang tải..." size="large" />;
  if (!course)
    return (
      <div className="p-8 text-center text-gray-500">
        Không tìm thấy thông tin khóa học.
      </div>
    );

  const languageName = course.language_id?.language;
  const levelName = course.languagelevel_id?.language_level;
  const teacherName = course.teacher_id?.full_name;
  const canWriteReview =
    !userHasReviewed && (userHasPaid || currentUser?.role === "Admin");
  const isRegisterDisabled =
    course.status === "finished" || course.status === "ongoing";

  return (
    <div className="w-full bg-[#F2F4F7] min-h-screen pb-20">
      {contextHolder}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative shrink-0">
            <img
              src={course.image || courseImagePlaceholder}
              alt={languageName}
              className="w-[340px] h-[220px] object-cover rounded-xl shadow-2xl border-4 border-slate-700/50"
            />
            <div className="absolute top-4 left-4">
              {getStatusTag(course.status)}
            </div>
          </div>

          <div className="flex flex-col flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              Khóa học {languageName} - {levelName}
            </h1>
            <p className="text-slate-300 text-lg mb-4">
              Mã KH:{" "}
              <span className="font-mono text-yellow-400">
                {course.courseid}
              </span>{" "}
              | Giảng viên: <strong>{teacherName || "Đang cập nhật"}</strong>
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 mb-6 text-sm">
              <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                <span className="text-yellow-400 font-bold text-lg">
                  {averageRating}
                </span>
                <Rate
                  disabled
                  allowHalf
                  value={parseFloat(averageRating)}
                  className="text-yellow-400 text-base"
                />
                <span className="text-slate-300">
                  ({reviews.length} đánh giá)
                </span>
              </div>
              <div className="flex items-center gap-6 text-slate-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <EyeOutlined /> {course.views || 0} xem
                </span>
                <span className="flex items-center gap-1.5">
                  <UsergroupAddOutlined /> {course.registration_count || 0} học
                  viên
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-auto">
              <Button
                type="default"
                size="large"
                icon={<PlayCircleOutlined />}
                className="!flex !items-center !gap-2 !bg-white/10 !text-white !border-white/30 hover:!bg-white/20 !rounded-full !px-6 !h-12 !text-base !font-semibold"
                onClick={() => setIsVideoModalVisible(true)}
              >
                Học thử miễn phí
              </Button>
              <Button
                type="primary"
                size="large"
                className={`hidden md:flex !items-center !gap-2 !rounded-full !px-8 !h-12 !text-base !font-bold !shadow-lg shadow-blue-500/20 ${
                  isRegisterDisabled
                    ? "!bg-gray-500 !border-gray-500"
                    : "!bg-blue-600 hover:!bg-blue-500"
                }`}
                onClick={handleRegister}
                disabled={isRegisterDisabled}
              >
                {isRegisterDisabled
                  ? "Ngoài thời gian đăng ký"
                  : "Đăng ký ngay"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1 flex flex-col gap-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ion-icon
                name="document-text-outline"
                class="text-blue-600"
              ></ion-icon>
              Mô tả khóa học
            </h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
              {course.Description ||
                "Hiện chưa có mô tả chi tiết cho khóa học này."}
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ion-icon
                name="checkmark-circle-outline"
                class="text-green-600"
              ></ion-icon>
              Bạn sẽ học được gì?
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Nắm vững kiến thức nền tảng",
                "Thực hành giao tiếp phản xạ",
                "Mở rộng vốn từ vựng chuyên ngành",
                "Tự tin tham gia các kỳ thi chứng chỉ",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <CheckCircleOutlined className="text-green-500 mt-1 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:w-[380px] shrink-0 ">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-50 p-6 border-b border-blue-100">
              <div className="text-sm text-blue-600 font-semibold uppercase tracking-wider mb-2">
                Học phí khóa học
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-red-600">
                  {course.discounted_price?.toLocaleString()}₫
                </span>
                {course.discount_percent > 0 && (
                  <span className="text-xl text-gray-400 line-through mb-1 font-medium">
                    {course.Tuition?.toLocaleString()}₫
                  </span>
                )}
              </div>
              {course.discount_percent > 0 && (
                <div className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded mt-2">
                  Tiết kiệm {course.discount_percent}%
                </div>
              )}
            </div>

            <div className="p-6 flex flex-col gap-5">
              <InfoItem
                icon={<CalendarOutlined />}
                label="Ngày bắt đầu"
                value={new Date(course.Start_Date).toLocaleDateString("vi-VN")}
              />
              <InfoItem
                icon={<CalendarOutlined />}
                label="Ngày kết thúc"
                value={new Date(course.end_date).toLocaleDateString("vi-VN")}
              />
              <InfoItem
                icon={<ClockCircleOutlined />}
                label="Thời lượng"
                value={`${course.Number_of_periods} tiết`}
              />
              {/* <InfoItem
                icon={<UsergroupAddOutlined />}
                label="Sĩ số tối đa"
                value="30 học viên"
              /> */}

              {/* Nút Đăng Ký (Desktop) */}
              {/* <Button
                type="primary"
                size="large"
                className={`!w-full !h-14 !text-lg !font-bold !rounded-xl !mt-4 !shadow-md ${
                  isRegisterDisabled
                    ? "!bg-gray-500 !border-gray-500"
                    : "!bg-blue-600 hover:!bg-blue-500"
                }`}
                onClick={handleRegister}
                disabled={isRegisterDisabled}
              >
                {isRegisterDisabled
                  ? "Ngoài thời gian đăng ký"
                  : "Đăng ký ngay"}
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12">
        <div
          className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100"
          id="reviews-section"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-1">
                <ion-icon
                  name="star-outline"
                  class="text-yellow-500"
                ></ion-icon>
                Đánh giá từ học viên
              </h2>
              <p className="text-gray-500 text-sm">
                Những nhận xét chân thực nhất về khóa học này từ học viên đã học
                tại trung tâm
              </p>
            </div>

            {canWriteReview && (
              <Button
                type="primary"
                icon={<StarFilled />}
                className="!flex !items-center !gap-2 !bg-blue-600 hover:!bg-blue-500 !font-semibold !px-6 !h-10 !rounded-lg"
                onClick={() => setIsReviewFormVisible(true)}
              >
                Viết đánh giá
              </Button>
            )}
          </div>
          <ReviewList reviews={reviews} />
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs font-medium">Học phí:</span>
          <span className="text-xl font-bold text-red-600">
            {course.discounted_price?.toLocaleString()}₫
          </span>
        </div>
        <Button
          type="primary"
          size="large"
          className={`!flex-1 !h-12 !text-base !font-bold !rounded-lg ${
            isRegisterDisabled
              ? "!bg-gray-500 !border-gray-500"
              : "!bg-blue-600 hover:!bg-blue-500"
          }`}
          onClick={handleRegister}
          disabled={isRegisterDisabled}
        >
          {isRegisterDisabled ? "Đã đóng" : "Đăng ký ngay"}
        </Button>
      </div>

      <ReviewForm
        open={isReviewFormVisible}
        onCreate={handleCreateReview}
        onCancel={() => setIsReviewFormVisible(false)}
        loading={isSubmittingReview}
      />

      {/* Video Modal */}
      <Modal
        open={isVideoModalVisible}
        onCancel={() => setIsVideoModalVisible(false)}
        footer={null}
        width={800}
        centered
        destroyOnClose
        className="!p-0 [&_.ant-modal-content]:!p-0 [&_.ant-modal-content]:!bg-transparent [&_.ant-modal-content]:!shadow-none [&_.ant-modal-close]:!text-white [&_.ant-modal-close]:!top-[-30px] [&_.ant-modal-close]:!right-0"
      >
        <div className="rounded-xl overflow-hidden shadow-2xl bg-black aspect-video">
          <YouTube
            videoId={demoVideoId}
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                autoplay: 1,
                modestbranding: 1,
                rel: 0,
              },
            }}
            className="w-full h-full"
          />
        </div>
      </Modal>
    </div>
  );
}

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-100 last:border-0">
    <div className="flex items-center gap-3 text-gray-600 font-medium">
      <span className="text-lg text-blue-500">{icon}</span>
      <span>{label}</span>
    </div>
    <span className="text-gray-900 font-semibold">{value}</span>
  </div>
);

export default CourseDetailPage;
