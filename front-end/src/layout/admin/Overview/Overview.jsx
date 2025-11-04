import React, { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Card, Statistic, Select, Spin, Empty } from "antd";
import {
  ReadOutlined,
  GlobalOutlined,
  BarChartOutlined,
  UserOutlined,
  TeamOutlined,
  ProfileOutlined,
  DollarCircleOutlined,
  UserAddOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";

const { Option } = Select;

// Helper để hiển thị tiêu đề động
const timeRangeLabels = {
  week: "Tuần qua",
  month: "Tháng qua",
  year: "Năm qua",
};

const Overview = () => {
  const [stats, setStats] = useState({
    courses: 0,
    languages: 0,
    levels: 0,
    students: 0,
    teachers: 0,
    registrations: 0,
    revenue: 0,
    newStudents: 0,
    topCourses: [], // state cho top khóa học
  });
  const [revenueData, setRevenueData] = useState([]);

  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);

  const { state } = useAuth();
  const { currentUser } = state;

  useEffect(() => {
    // Chỉ fetch dữ liệu nếu người dùng là Admin
    if (currentUser && currentUser.role === 'Admin') {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [statsRes, revenueRes] = await Promise.all([
            apiClient.get("/overview/stats", {
              params: { range: timeRange },
            }),
            apiClient.get("/overview/revenue-stats", {
              params: { range: timeRange },
            }),
          ]);

          //đảm bảo không bị lỗi nếu API trả về null/undefined
          setStats(statsRes.data || { topCourses: [] });
          setRevenueData(revenueRes.data || []);
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu dashboard", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      // Nếu không phải admin, không tải dữ liệu và dừng loading
      setLoading(false);
    }
  }, [timeRange, currentUser]);

  const formatVND = (value) => new Intl.NumberFormat("vi-VN").format(value);

  // Dữ liệu cho biểu đồ
  const pieData = [
    { name: "Khóa học", value: stats.courses },
    { name: "Ngôn ngữ", value: stats.languages },
    { name: "Trình độ", value: stats.levels },
  ];

  const barData = [
    { name: "Học viên", value: stats.students },
    { name: "Đăng ký học", value: stats.registrations },
  ];

  const COLORS = ["#1890ff", "#52c41a", "#faad14", "#eb2f96", "#722ed1"];

  if (!currentUser || currentUser.role !== 'Admin') {
    return <div style={{ padding: '20px' }}>Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h2 style={{ marginBottom: "20px" }}>Thống kê hệ thống</h2>
      <Select
        value={timeRange}
        onChange={(value) => setTimeRange(value)}
        style={{ width: 120 }}
      >
        <Option value="week">Theo tuần</Option>
        <Option value="month">Theo tháng</Option>
        <Option value="year">Theo năm</Option>
      </Select>
      </div>
<Spin spinning={loading} tip="Đang tải dữ liệu...">
      {/* Grid Card thống kê */}
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Khóa học"
              value={stats.courses}
              prefix={<ReadOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Ngôn ngữ"
              value={stats.languages}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Trình độ"
              value={stats.levels}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Học viên"
              value={stats.students}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Giảng viên"
              value={stats.teachers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={`Đăng ký mới (${timeRangeLabels[timeRange]})`}
              value={stats.registrations}
              prefix={<ProfileOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              // title="Tổng doanh thu (VND)"
              title={`Doanh thu (${timeRangeLabels[timeRange]})`}
              value={stats.revenue}
              precision={0} // Không hiển thị số thập phân
              prefix={<DollarCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={`Học viên mới (${timeRangeLabels[timeRange]})`}
              value={stats.newStudents}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: "30px" }}>
        <Col span={24}>
          <Card title={`Doanh thu (${timeRangeLabels[timeRange]})`}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatVND} />
                <Tooltip formatter={(value) => `${formatVND(value)} VNĐ`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#8884d8"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      {/* Biểu đồ */}
      <Row gutter={[16, 16]} style={{ marginTop: "30px" }}>
        <Col span={12}>
          <Card title="Tỷ lệ khóa học / ngôn ngữ / trình độ">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top 5 khóa học được đăng ký nhiều nhất">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topCourses} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Số lượt đăng ký" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Spin>
    </div>
  );
};

export default Overview;
