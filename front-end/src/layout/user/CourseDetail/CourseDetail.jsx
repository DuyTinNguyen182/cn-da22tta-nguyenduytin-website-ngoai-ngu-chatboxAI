import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Spin,
  message,
  Rate,
  Modal,
  Divider,
  Radio,
  Tag,
  Typography,
  Tooltip,
} from "antd";
import {
  StarFilled,
  EyeOutlined,
  UsergroupAddOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  LikeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import YouTube from "react-youtube";
import apiClient from "../../../api/axiosConfig";
import { useAuth } from "../../../context/AuthContext";
import ReviewList from "../../../components/ReviewList/ReviewList";
import ReviewForm from "../../../components/ReviewForm/ReviewForm";
import courseImagePlaceholder from "../../../imgs/image.png";

const { Text } = Typography;

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

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [registering, setRegistering] = useState(false);

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

  const handleOpenRegisterModal = async () => {
    if (!userId) {
      messageApi.error("Vui lòng đăng nhập để đăng ký khóa học!");
      return;
    }

    if (isRegisterDisabled) {
      messageApi.warning("Hiện tại không thể đăng ký khóa học này.");
      return;
    }

    setIsRegisterModalOpen(true);
    setLoadingSessions(true);

    try {
      const [allSessionsRes, courseRegsRes] = await Promise.all([
        apiClient.get("/class-sessions"),
        apiClient.get(`/registration/course/${courseId}`),
      ]);

      const allSessions = allSessionsRes.data;
      const registeredList = courseRegsRes.data;

      const sessionCounts = {};
      registeredList.forEach((reg) => {
        if (reg.class_session_id && reg.class_session_id._id) {
          const sId = reg.class_session_id._id;
          sessionCounts[sId] = (sessionCounts[sId] || 0) + 1;
        }
      });

      const sessionsWithStats = allSessions.map((session) => ({
        ...session,
        studentCount: sessionCounts[session._id] || 0,
      }));

      setSessions(sessionsWithStats);
    } catch (error) {
      messageApi.error("Không thể tải thông tin lớp học.");
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleConfirmRegister = async () => {
    if (!selectedSession) {
      messageApi.error("Vui lòng chọn một buổi học!");
      return;
    }

    setRegistering(true);
    try {
      await apiClient.post("/registration", {
        user_id: userId,
        course_id: course._id,
        class_session_id: selectedSession,
      });

      messageApi.success("Đăng ký thành công! Đang chuyển hướng...");
      setIsRegisterModalOpen(false);
      setTimeout(() => navigate(`/my-courses/${userId}`), 1000);
    } catch (error) {
      const msg = error.response?.data?.message || "Đăng ký thất bại.";
      if (error.response?.data?.status === "already_registered") {
        messageApi.warning("Bạn đã đăng ký khóa học này rồi!");
      } else {
        messageApi.error(msg);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleCreateReview = async (values) => {
    setIsSubmittingReview(true);
    try {
      await apiClient.post("/review", { course_id: courseId, ...values });
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

  const startDate = new Date(course.Start_Date);
  const registerDeadline = new Date(startDate);
  registerDeadline.setDate(startDate.getDate() - 2);
  const isLateToRegister = new Date() > registerDeadline;

  const isRegisterDisabled =
    course.status === "finished" ||
    course.status === "ongoing" ||
    isLateToRegister;

  const shouldShowReviewButton =
    !userHasReviewed && (userHasPaid || currentUser?.role === "Admin");
  const canSubmitReview = course.status === "finished";

  return (
    <div className="w-full bg-[#F2F4F7] min-h-screen pb-20">
      {contextHolder}

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div
            className="relative shrink-0 group cursor-pointer"
            onClick={() => setIsVideoModalVisible(true)}
          >
            <img
              src={course.image || courseImagePlaceholder}
              alt={languageName}
              className="w-[340px] h-[220px] object-cover rounded-xl shadow-2xl border-4 border-slate-700/50 group-hover:brightness-75 transition-all"
            />
            <div className="absolute top-4 left-4">
              {getStatusTag(course.status)}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircleOutlined className="text-5xl text-white drop-shadow-lg" />
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
                onClick={handleOpenRegisterModal}
                disabled={isRegisterDisabled}
              >
                {isLateToRegister
                  ? "Hết hạn đăng ký"
                  : isRegisterDisabled
                  ? "Đã đóng đăng ký"
                  : "Đăng ký ngay"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 order-2 lg:order-1 w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileTextOutlined className="text-blue-600" />
              Giới thiệu khóa học
            </h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line text-lg text-justify">
              {course.Description ||
                "Hiện chưa có mô tả chi tiết cho khóa học này."}
            </div>
          </div>
          <Divider />
          <div className="my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <LikeOutlined className="text-green-600" />
              Lợi ích khi tham gia
            </h2>
            <div className="bg-green-50/50 p-6 rounded-xl border border-green-100">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Nắm vững kiến thức nền tảng",
                  "Thực hành giao tiếp phản xạ",
                  "Mở rộng vốn từ vựng chuyên ngành",
                  "Tự tin tham gia các kỳ thi chứng chỉ",
                  "Giảng viên hỗ trợ nhiệt tình",
                  "Môi trường học tập năng động",
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
          <Divider />
          <div className="mt-8" id="reviews-section">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <StarFilled className="text-yellow-400" />
                  Đánh giá từ học viên
                </h2>
              </div>
              {/* [MỚI] Logic hiển thị nút đánh giá */}
              {shouldShowReviewButton && (
                <Tooltip
                  title={
                    !canSubmitReview
                      ? "Bạn chỉ có thể đánh giá sau khi khóa học kết thúc"
                      : ""
                  }
                >
                  <Button
                    type="primary"
                    className={!canSubmitReview ? "bg-gray-400" : "bg-blue-600"}
                    disabled={!canSubmitReview}
                    onClick={() => setIsReviewFormVisible(true)}
                  >
                    Viết đánh giá
                  </Button>
                </Tooltip>
              )}
            </div>
            <ReviewList reviews={reviews} />
          </div>
        </div>
        <div className="lg:w-[360px] w-full shrink-0 order-1 lg:order-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-50 p-6 border-b border-blue-100">
              <div className="text-sm text-blue-600 font-semibold uppercase tracking-wider mb-2">
                Học phí ưu đãi
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

              <Button
                type="primary"
                size="large"
                className={`!w-full !h-12 !text-lg !font-bold !rounded-xl !mt-2 !shadow-md ${
                  isRegisterDisabled
                    ? "!bg-gray-500 !border-gray-500"
                    : "!bg-blue-600 hover:!bg-blue-500"
                }`}
                onClick={handleOpenRegisterModal}
                disabled={isRegisterDisabled}
              >
                {isLateToRegister
                  ? "Hết hạn đăng ký"
                  : isRegisterDisabled
                  ? "Đã đóng đăng ký"
                  : "Đăng ký ngay"}
              </Button>

              <div className="text-center text-xs text-gray-400 mt-2">
                Cần hỗ trợ? Gọi ngay:{" "}
                <a href="tel:0794325729" className="text-blue-500 font-bold">
                  0794 325 729
                </a>
              </div>
            </div>
          </div>
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
          onClick={handleOpenRegisterModal}
          disabled={isRegisterDisabled}
        >
          {isLateToRegister
            ? "Hết hạn"
            : isRegisterDisabled
            ? "Đã đóng"
            : "Đăng ký ngay"}
        </Button>
      </div>
      <Modal
        title={
          <div className="text-xl font-bold text-blue-700 border-b border-gray-100 pb-3">
            <ClockCircleOutlined className="mr-2" /> Chọn lịch học
          </div>
        }
        open={isRegisterModalOpen}
        onCancel={() => setIsRegisterModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsRegisterModalOpen(false)}>
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={registering}
            onClick={handleConfirmRegister}
            disabled={!selectedSession}
            className="bg-blue-600"
          >
            Xác nhận đăng ký
          </Button>,
        ]}
        centered
      >
        <div className="py-4">
          <p className="mb-4 text-gray-600">
            Vui lòng chọn buổi học phù hợp với thời gian biểu của bạn:
          </p>

          {loadingSessions ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : (
            <Radio.Group
              onChange={(e) => setSelectedSession(e.target.value)}
              value={selectedSession}
              className="w-full flex flex-col gap-3"
            >
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedSession === session._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <Radio value={session._id} className="w-full">
                    <div className="flex justify-between items-center w-full ml-2">
                      <div>
                        <div className="font-bold text-gray-800">
                          {session.days}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {session.time}
                        </div>
                      </div>
                      <Tag
                        color={session.studentCount >= 15 ? "green" : "orange"}
                        className="mr-0 text-sm py-1 px-2"
                      >
                        <UsergroupAddOutlined /> {session.studentCount} HV đã
                        đăng ký
                      </Tag>
                    </div>
                  </Radio>
                </div>
              ))}
            </Radio.Group>
          )}

          <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 flex items-start gap-2 text-sm">
            <ExclamationCircleOutlined className="mt-0.5 text-lg" />
            <span>
              <strong>Lưu ý quan trọng:</strong> Lớp học sẽ chỉ được mở khi số
              lượng đăng ký đạt <strong>trên 15 học viên</strong>. Nếu lớp chưa
              đủ sĩ số, trung tâm sẽ liên hệ để sắp xếp lịch khác hoặc hoàn phí.
            </span>
          </div>
        </div>
      </Modal>
      <ReviewForm
        open={isReviewFormVisible}
        onCreate={handleCreateReview}
        onCancel={() => setIsReviewFormVisible(false)}
        loading={isSubmittingReview}
      />
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
              playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
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
