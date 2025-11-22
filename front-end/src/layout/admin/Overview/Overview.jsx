import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Select, Spin, Empty } from "antd";
import {
  ReadOutlined,
  GlobalOutlined,
  UserOutlined,
  TeamOutlined,
  ProfileOutlined,
  DollarCircleOutlined,
  UserAddOutlined,
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
    revenueByLanguage: [],
    topTeachers: [],
  });
  const [revenueData, setRevenueData] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);

  const { state } = useAuth();
  const { currentUser } = state;

  const fillMissingDates = (data, range) => {
    const result = [];
    const today = new Date();
    const dataMap = new Map(data.map((item) => [item.date, item.revenue]));

    if (range === "year") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const keyYear = d.getFullYear();
        const keyMonth = String(d.getMonth() + 1).padStart(2, "0");
        const lookupKey = `${keyYear}-${keyMonth}`;
        const displayDate = `${keyMonth}/${keyYear}`;
        result.push({
          date: displayDate,
          revenue: dataMap.get(lookupKey) || 0,
        });
      }
    } else {
      const daysBack = range === "week" ? 6 : 29;
      for (let i = daysBack; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const lookupKey = d.toLocaleDateString("en-CA");
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const displayDate = `${day}/${month}/${year}`;
        result.push({
          date: displayDate,
          revenue: dataMap.get(lookupKey) || 0,
        });
      }
    }
    return result;
  };

  useEffect(() => {
    if (currentUser && currentUser.role === "Admin") {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [statsRes, revenueRes] = await Promise.all([
            apiClient.get("/overview/stats", { params: { range: timeRange } }),
            apiClient.get("/overview/revenue-stats", {
              params: { range: timeRange },
            }),
          ]);

          setStats(statsRes.data || { revenueByLanguage: [], topTeachers: [] });

          const rawRevenueData = revenueRes.data || [];
          const filledData = fillMissingDates(rawRevenueData, timeRange);
          setRevenueData(filledData);
        } catch (error) {
          console.error("Lỗi dữ liệu:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [timeRange, currentUser]);

  const formatVND = (value) => new Intl.NumberFormat("vi-VN").format(value);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF4560",
  ];

  if (!currentUser || currentUser.role !== "Admin") {
    return <div style={{ padding: "20px" }}>Bạn không có quyền truy cập.</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Thống kê hệ thống</h2>
        <Select
          value={timeRange}
          onChange={setTimeRange}
          style={{ width: 120 }}
        >
          <Option value="week">Theo tuần</Option>
          <Option value="month">Theo tháng</Option>
          <Option value="year">Theo năm</Option>
        </Select>
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Khóa học"
                value={stats.courses}
                prefix={<ReadOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Ngôn ngữ"
                value={stats.languages}
                prefix={<GlobalOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Học viên"
                value={stats.students}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
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
                title={`Doanh thu (${timeRangeLabels[timeRange]})`}
                value={stats.revenue}
                precision={0}
                suffix="₫"
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
            <Card title={`Biểu đồ doanh thu (${timeRangeLabels[timeRange]})`}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    tickFormatter={(val) =>
                      new Intl.NumberFormat("vi-VN", {
                        notation: "compact",
                      }).format(val)
                    }
                  />
                  <Tooltip formatter={(value) => `${formatVND(value)} VNĐ`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Doanh thu"
                    stroke="#8884d8"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: "30px" }}>
          <Col xs={24} lg={12}>
            <Card title="Tỷ trọng doanh thu theo Ngôn ngữ">
              {stats.revenueByLanguage && stats.revenueByLanguage.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.revenueByLanguage}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {stats.revenueByLanguage.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${formatVND(value)} VNĐ`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Chưa có dữ liệu doanh thu" />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Top 5 Giáo viên tiêu biểu (Theo số lượng học viên)">
              {stats.topTeachers && stats.topTeachers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={stats.topTeachers}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Số lượng học viên"
                      fill="#FF8042"
                      radius={[0, 10, 10, 0]}
                    >
                      {stats.topTeachers.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Chưa có dữ liệu giáo viên" />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Overview;
