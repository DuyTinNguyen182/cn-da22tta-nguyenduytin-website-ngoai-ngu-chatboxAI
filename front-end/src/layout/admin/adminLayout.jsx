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
} from "@ant-design/icons";
import { Flex, Layout, Menu, Spin, Result, Button } from "antd";
import { Link, Route, Routes, useLocation, Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

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

const { Sider } = Layout;

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
  const [collapsed, setCollapsed] = useState(false);

  const { state } = useAuth();
  const { currentUser, loading } = state;

  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const activeTab = pathSnippets.length > 1 ? pathSnippets[1] : "overview";

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
        <Flex
          className="admin-logo"
          style={{ color: "white", padding: "20px", height: "64px" }}
          align="center"
          justify={!collapsed ? "space-between" : "center"}
        >
          {!collapsed && <h2>DREAM ADMIN</h2>}
          <Link to="/" target="_blank" title="Xem trang người dùng">
            <ExportOutlined style={{ color: "white", fontSize: "16px" }} />
          </Link>
        </Flex>
        <Menu
          theme="dark"
          selectedKeys={[activeTab]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout
        style={{ padding: "20px 30px", height: "100vh", overflowY: "auto" }}
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
        </Routes>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
