import { useEffect, useState } from "react";
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
} from "@ant-design/icons";
import {
  Flex,
  Layout,
  Menu,
  Spin,
  Result,
  Button,
  Avatar,
  Typography,
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
import ContactManager from "./ContactManager/Contactmanager";
import ClassSessionManager from "./ClassSessionManager/ClassSessionManager";
import AdminClassManager from "./ClassManager/AdminClassManager";
import CouponManager from "./CouponManager/CouponManager";
import UpdateCoupon from "./CouponManager/UpdateCoupon";
import SlideshowManager from "./SlideshowManager/SlideshowManager";
import UpdateSlideshow from "./SlideshowManager/UpdateSlideshow";

const { Sider } = Layout;
const { Text } = Typography;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

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
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            paddingBottom: "50px",
          }}
        >
          <Flex
            className="admin-user-info"
            align="center"
            justify={collapsed ? "center" : "flex-start"}
            style={{
              padding: "20px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: "10px",
              transition: "all 0.2s",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                size={collapsed ? 40 : 44}
                src={currentUser.avatar}
                icon={<UserOutlined />}
                style={{ border: "2px solid #1890ff" }}
              />

              <Link to="/" target="_blank" title="Xem trang người dùng">
                <ExportOutlined
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -4,
                    backgroundColor: "#1890ff",
                    color: "white",
                    padding: "4px",
                    borderRadius: "50%",
                    fontSize: "10px",
                    border: "2px solid #001529",
                    cursor: "pointer",
                  }}
                />
              </Link>
            </div>

            {!collapsed && (
              <div
                style={{
                  marginLeft: "12px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                    lineHeight: "1.2",
                    marginBottom: "4px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "160px",
                  }}
                >
                  {currentUser.fullname}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: "1",
                  }}
                >
                  {currentUser.role}
                </div>
              </div>
            )}
          </Flex>

          <Menu
            theme="dark"
            selectedKeys={[activeTab]}
            mode="inline"
            items={menuItems}
            style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
          />

          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Button
              type="text"
              danger
              block
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{
                textAlign: collapsed ? "center" : "left",
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                color: "#ff4d4f",
              }}
            >
              {!collapsed && "Đăng xuất"}
            </Button>
          </div>
        </div>
      </Sider>

      <Layout
        style={{ padding: "5px 30px", height: "100vh", overflowY: "auto" }}
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
