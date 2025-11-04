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
} from "@ant-design/icons";
import { Flex, Layout, Menu } from "antd";
import { Link, Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";

import Overview from "./Overview/Overview";

const { Sider } = Layout;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

const items = [
  getItem(<Link to="/admin/overview">Tổng quan</Link>, "overview", <PieChartOutlined />),
  getItem(<Link to="/admin/users">Quản lý người dùng</Link>, "users", <UserOutlined />),
  getItem(<Link to="/admin/languages">Quản lý ngôn ngữ</Link>, "languages", <GlobalOutlined />),
  getItem(<Link to="/admin/languageslevel">Quản lý trình độ</Link>, "languageslevel", <BarChartOutlined />),
  getItem(<Link to="/admin/teachers">Quản lý giảng viên</Link>, "teachers", <TeamOutlined />),
  getItem(<Link to="/admin/courses">Quản lý khóa học</Link>, "courses", <ReadOutlined />),
  getItem(<Link to="/admin/registercourses">Quản lý đăng ký học</Link>, "registercourses", <BookOutlined />),
];

const adminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState();

  // Xác định tab active theo URL
  const activeTab =
    location.pathname.startsWith("/admin/users") ? "users" :
    location.pathname.startsWith("/admin/courses") ? "courses" :
    location.pathname.startsWith("/admin/teachers") ? "teachers" :
    location.pathname.startsWith("/admin/registercourses") ? "registercourses" :
    location.pathname.startsWith("/admin/languageslevel") ? "languageslevel" :
    location.pathname.startsWith("/admin/languages") ? "languages" :
    "overview";

  const fetchUserData = () => {
    axios
      .get(`http://localhost:3005/api/user/info`, { withCredentials: true })
      .then((response) => {
        if (response.data.role !== "Admin") {
          navigate("/");
        }
        setCurrentUser(response.data);
      })
      .catch(() => navigate("/"));
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div>
      {currentUser && (
        <Layout style={{ minHeight: "100vh" }}>
          <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={260}>
            <Flex
              className="demo-logo-vertical"
              style={{ color: "white", padding: "20px" }}
              justify={!collapsed ? "space-between" : "center"}
            >
              {!collapsed && <h2>DREAM ADMIN</h2>}
              <Link to="/" target="_blank">
                <ExportOutlined style={{ color: "white" }} />
              </Link>
            </Flex>
            <Menu theme="dark" selectedKeys={[activeTab]} mode="inline" items={items} />
          </Sider>
          <Layout style={{ padding: "20px 30px", height: "100vh", overflowY: "auto" }}>
            <Routes>
              <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
              <Route path="overview" element={<Overview />} />             
            </Routes>
          </Layout>
        </Layout>
      )}
    </div>
  );
};

export default adminLayout;
