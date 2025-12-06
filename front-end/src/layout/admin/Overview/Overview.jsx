import React, { useEffect, useState } from "react";
import { Select, Spin, Empty } from "antd";
import {
  ReadOutlined,
  GlobalOutlined,
  UserOutlined,
  TeamOutlined,
  ProfileOutlined,
  DollarCircleOutlined,
  UserAddOutlined,
  CalendarOutlined,
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
  AreaChart,
  Area,
} from "recharts";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";

const StatCard = ({ title, value, icon, colorClass, suffix }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
          {typeof value === "number"
            ? new Intl.NumberFormat("vi-VN").format(value)
            : value}
          {suffix && (
            <span className="text-lg text-gray-400 font-normal ml-1">
              {suffix}
            </span>
          )}
        </h3>
      </div>
      <div
        className={`p-3 rounded-lg bg-opacity-10 ${colorClass.replace(
          "text-",
          "bg-"
        )} ${colorClass}`}
      >
        {React.cloneElement(icon, { className: "text-xl" })}
      </div>
    </div>
  </div>
);

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
    revenueDetailed: [],
    topTeachers: [],
  });
  const [revenueData, setRevenueData] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const { state } = useAuth();
  const { currentUser } = state;

  const timeRangeLabels = {
    week: "Tuần qua",
    month: "Tháng qua",
    year: "Năm qua",
  };

  const fillMissingDates = (data, range) => {
    const result = [];
    const today = new Date();
    const dataMap = new Map(data.map((item) => [item.date, item.revenue]));

    if (range === "year") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        const label = `${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}/${d.getFullYear()}`;
        result.push({ date: label, revenue: dataMap.get(key) || 0 });
      }
    } else {
      const daysBack = range === "week" ? 6 : 29;
      for (let i = daysBack; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const key = d.toLocaleDateString("en-CA");
        const label = `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1
        ).padStart(2, "0")}`;
        result.push({ date: label, revenue: dataMap.get(key) || 0 });
      }
    }
    return result;
  };

  useEffect(() => {
    if (currentUser?.role === "Admin") {
      setLoading(true);
      Promise.all([
        apiClient.get("/overview/stats", { params: { range: timeRange } }),
        apiClient.get("/overview/revenue-stats", {
          params: { range: timeRange },
        }),
      ])
        .then(([statsRes, revenueRes]) => {
          setStats(statsRes.data || {});
          setRevenueData(fillMissingDates(revenueRes.data || [], timeRange));
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [timeRange, currentUser]);

  const formatVND = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#6366F1",
    "#14B8A6",
  ];

  if (currentUser?.role !== "Admin")
    return <div className="p-6 text-center text-red-500">Access Denied</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">
            Dashboard Quản Trị
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Tổng quan số liệu kinh doanh
          </p>
        </div>
        <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex items-center">
          <CalendarOutlined className="ml-3 text-gray-400" />
          <Select
            value={timeRange}
            onChange={setTimeRange}
            variant="borderless"
            style={{ width: 140, fontWeight: 500 }}
          >
            <Select.Option value="week">Tuần này</Select.Option>
            <Select.Option value="month">Tháng này</Select.Option>
            <Select.Option value="year">Năm nay</Select.Option>
          </Select>
        </div>
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <div className="flex flex-col gap-6">
          {/* 1. KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Tổng Khóa học"
              value={stats.courses}
              icon={<ReadOutlined />}
              colorClass="text-blue-600"
            />
            <StatCard
              title="Tổng Ngôn ngữ"
              value={stats.languages}
              icon={<GlobalOutlined />}
              colorClass="text-green-600"
            />
            <StatCard
              title="Tổng Học viên"
              value={stats.students}
              icon={<UserOutlined />}
              colorClass="text-purple-600"
            />
            <StatCard
              title="Tổng Giảng viên"
              value={stats.teachers}
              icon={<TeamOutlined />}
              colorClass="text-orange-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title={`Đăng ký mới (${timeRangeLabels[timeRange]})`}
              value={stats.registrations}
              icon={<ProfileOutlined />}
              colorClass="text-indigo-600"
            />
            <StatCard
              title={`Doanh thu (${timeRangeLabels[timeRange]})`}
              value={stats.revenue}
              suffix="₫"
              icon={<DollarCircleOutlined />}
              colorClass="text-emerald-600"
            />
            <StatCard
              title={`Học viên mới (${timeRangeLabels[timeRange]})`}
              value={stats.newStudents}
              icon={<UserAddOutlined />}
              colorClass="text-pink-600"
            />
          </div>

          {/* 2. MAIN CHARTS AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột trái: Biểu đồ doanh thu theo thời gian (Chiếm 2/3) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-6">
                Biểu đồ doanh thu ({timeRangeLabels[timeRange]})
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueData}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      tickFormatter={(val) =>
                        new Intl.NumberFormat("vi-VN", {
                          notation: "compact",
                        }).format(val)
                      }
                    />
                    <Tooltip
                      formatter={(value) => formatVND(value)}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh thu"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cột phải: Biểu đồ tròn Tỷ trọng chi tiết (Chiếm 1/3) */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Cơ cấu doanh thu
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Chi tiết theo Ngôn ngữ & Trình độ
              </p>

              <div className="flex-1 min-h-[300px]">
                {stats.revenueDetailed?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.revenueDetailed}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name" // Dùng field 'name' đã gộp từ BE
                      >
                        {stats.revenueDetailed.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatVND(value)} />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px", marginLeft: "20px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty
                    description="Chưa có dữ liệu"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 3. TOP TEACHERS (Full Width) */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Top 5 Giáo viên tiêu biểu
            </h3>
            <div className="h-64 w-full">
              {stats.topTeachers?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.topTeachers}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={150}
                      tick={{ fontSize: 13, fontWeight: 500, fill: "#4B5563" }}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{ borderRadius: "8px" }}
                    />
                    <Bar
                      dataKey="count"
                      name="Số học viên"
                      fill="#F97316"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
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
                <Empty
                  description="Chưa có dữ liệu"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default Overview;
