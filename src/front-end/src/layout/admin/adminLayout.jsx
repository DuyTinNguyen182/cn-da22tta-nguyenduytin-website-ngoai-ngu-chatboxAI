import { useState } from "react";
import {
  PieChartOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  ExportOutlined,
  GlobalOutlined,
  BarChartOutlined,
  ReadOutlined,
  StarOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  AuditOutlined,
  TagsOutlined,
  PictureOutlined,
  LogoutOutlined,
  DownOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import {
  Flex,
  Layout,
  Menu,
  Spin,
  Result,
  Button,
  Avatar,
  Dropdown, // Import thêm Dropdown
  theme,
} from "antd";
import {
  Link,
  Route,
  Routes,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/axiosConfig";

// Import các component con (Giữ nguyên như cũ)
import Overview from "./Overview/Overview";
import UserManager from "./UserManager/UserManager";
import UpdateUser from "./UserManager/UpdateUser";
import LanguageManager from "./LanguageManager/LanguageManager";
import UpdateLanguage from "./LanguageManager/UpdateLanguage";
import LanguageLevelManager from "./LanguageLevelManager/LanguageLevelManager";
import UpdateLanguageLevel from "./LanguageLevelManager/UpdateLanguageLevel";
import TeacherManager from "./TeacherManager/TeacherManager";
import UpdateTeacher from "./TeacherManager/UpdateTeacher";
import CourseManager from "./CourseManager/CourseManager";
import UpdateCourse from "./CourseManager/UpdateCourse";
import CourseRegistrationManager from "./CourseRegistrationManager/CourseRegistrationManager";
import UpdateCourseRegistration from "./CourseRegistrationManager/UpdateCourseRegistration";
import ReviewManager from "./ReviewManager/ReviewManager";
import ContactManager from "./ContactManager/ContactManager";
import ClassSessionManager from "./ClassSessionManager/ClassSessionManager";
import AdminClassManager from "./ClassManager/AdminClassManager";
import CouponManager from "./CouponManager/CouponManager";
import UpdateCoupon from "./CouponManager/UpdateCoupon";
import SlideshowManager from "./SlideshowManager/SlideshowManager";
import UpdateSlideshow from "./SlideshowManager/UpdateSlideshow";

const { Sider } = Layout;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

// Menu chính của Sidebar (Bỏ nút đăng xuất ở đây)
const menuItems = [
  getItem(
    <Link to="overview">Tổng quan</Link>,
    "overview",
    <PieChartOutlined />
  ),
  getItem(
    <Link to="users">Quản lý người dùng</Link>,
    "users",
    <UserOutlined />
  ),
  getItem(
    <Link to="languages">Quản lý ngôn ngữ</Link>,
    "languages",
    <GlobalOutlined />
  ),
  getItem(
    <Link to="languageslevel">Quản lý trình độ</Link>,
    "languageslevel",
    <BarChartOutlined />
  ),
  getItem(
    <Link to="teachers">Quản lý giảng viên</Link>,
    "teachers",
    <TeamOutlined />
  ),
  getItem(
    <Link to="courses">Quản lý khóa học</Link>,
    "courses",
    <ReadOutlined />
  ),
  getItem(
    <Link to="coupons">Quản lý mã giảm giá</Link>,
    "coupons",
    <TagsOutlined />
  ),
  getItem(
    <Link to="class-sessions">Quản lý buổi học</Link>,
    "class-sessions",
    <ClockCircleOutlined />
  ),
  getItem(
    <Link to="registercourses">Quản lý đăng ký học</Link>,
    "registercourses",
    <BookOutlined />
  ),
  getItem(
    <Link to="classes">Quản lý lớp học</Link>,
    "classes",
    <AuditOutlined />
  ),
  getItem(
    <Link to="slideshow">Quản lý Banner</Link>,
    "slideshow",
    <PictureOutlined />
  ),
  getItem(
    <Link to="reviews">Quản lý đánh giá</Link>,
    "reviews",
    <StarOutlined />
  ),
  getItem(
    <Link to="contacts">Quản lý liên hệ</Link>,
    "contacts",
    <PhoneOutlined />
  ),
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken(); // Lấy màu từ theme để style đẹp hơn

  const { state, dispatch } = useAuth();
  const { currentUser, loading } = state;

  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const activeTab = pathSnippets.length > 1 ? pathSnippets[1] : "overview";

  const handleLogout = async () => {
    try {
      await apiClient.get(`/auth/logout`);
      dispatch({ type: "AUTH_FAILURE" });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  // Cấu hình menu cho Dropdown (Popup)
  const userDropdownItems = [
    {
      key: "home",
      label: (
        <Link to="/" target="_blank">
          Xem trang người dùng
        </Link>
      ),
      icon: <ExportOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  if (loading) {
    return <Spin fullscreen tip="Đang kiểm tra quyền truy cập..." />;
  }

  if (!currentUser || currentUser.role !== "Admin") {
    return (
      <Result
        status="403"
        title="403 - Forbidden"
        subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
        extra={
          <Button type="primary">
            <Link to="/">Quay về Trang chủ</Link>
          </Button>
        }
      />
    );
  }

  return (
    // FIX SCROLLBAR: Đặt cố định chiều cao 100vh và ẩn thanh cuộn thừa
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        style={{
          overflowY: "auto", // Cho phép menu cuộn nếu quá dài
          height: "100vh", // Full chiều cao
          scrollbarWidth: "thin", // (Tùy chọn) Thanh cuộn mỏng cho đẹp trên Firefox
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
          }}
        >
          {/* PHẦN USER INFO + DROPDOWN */}
          <div style={{ padding: "20px 15px 10px 15px" }}>
            <Dropdown
              menu={{ items: userDropdownItems }}
              trigger={["click"]}
              placement="bottomRight"
              arrow
            >
              <Flex
                align="center"
                justify={collapsed ? "center" : "flex-start"}
                style={{
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
                className="user-profile-trigger" // Class để hover effect nếu muốn
              >
                <Avatar
                  size={collapsed ? 36 : 40}
                  src={currentUser.avatar}
                  icon={<UserOutlined />}
                  style={{ border: "2px solid #1890ff", flexShrink: 0 }}
                />

                {!collapsed && (
                  <div style={{ marginLeft: 12, overflow: "hidden", flex: 1 }}>
                    <div
                      style={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {currentUser.fullname}
                    </div>
                    <Flex justify="space-between" align="center">
                      <span
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {currentUser.role}
                      </span>
                      <CaretDownOutlined
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      />
                    </Flex>
                  </div>
                )}
              </Flex>
            </Dropdown>
          </div>

          <div style={{ padding: "0 15px", marginBottom: "10px" }}>
            <div
              style={{
                height: "1px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
            ></div>
          </div>

          {/* MENU CHÍNH */}
          <Menu
            theme="dark"
            selectedKeys={[activeTab]}
            mode="inline"
            items={menuItems}
            style={{ borderRight: 0 }}
          />
        </div>
      </Sider>

      {/* FIX SCROLLBAR: Layout nội dung chiếm phần còn lại */}
      <Layout
        style={{
          height: "100%",
          overflowY: "auto", // Chỉ hiện thanh cuộn ở đây
          padding: "5px 30px",
          backgroundColor: "#f0f2f5", // Màu nền chuẩn Antd
        }}
      >
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="users" element={<UserManager />} />
          <Route path="users/update/:id" element={<UpdateUser />} />
          <Route path="languages" element={<LanguageManager />} />
          <Route path="languages/update/:id" element={<UpdateLanguage />} />
          <Route path="languageslevel" element={<LanguageLevelManager />} />
          <Route
            path="languageslevel/update/:id"
            element={<UpdateLanguageLevel />}
          />
          <Route path="teachers" element={<TeacherManager />} />
          <Route path="teachers/update/:id" element={<UpdateTeacher />} />
          <Route path="courses" element={<CourseManager />} />
          <Route path="courses/update/:id" element={<UpdateCourse />} />
          <Route
            path="registercourses"
            element={<CourseRegistrationManager />}
          />
          <Route
            path="registercourses/update/:registrationId"
            element={<UpdateCourseRegistration />}
          />
          <Route path="reviews" element={<ReviewManager />} />
          <Route path="contacts" element={<ContactManager />} />
          <Route path="class-sessions" element={<ClassSessionManager />} />
          <Route path="classes" element={<AdminClassManager />} />
          <Route path="coupons" element={<CouponManager />} />
          <Route path="coupons/update/:id" element={<UpdateCoupon />} />
          <Route path="slideshow" element={<SlideshowManager />} />
          <Route path="slideshow/update/:id" element={<UpdateSlideshow />} />
        </Routes>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
