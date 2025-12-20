import React, { useEffect, useState } from "react";
import { Select, Spin } from "antd";
import {
  ReadOutlined,
  GlobalOutlined,
  UserOutlined,
  TeamOutlined,
  ProfileOutlined,
  DollarCircleOutlined,
  UserAddOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TrophyOutlined,
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

const formatCurrency = (value) => {
  if (!value && value !== 0) return "0";
  return new Intl.NumberFormat("vi-VN").format(value);
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 2) return `T${parts[1]}/${parts[0]}`;
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
};

const fillChartData = (apiData, timeRange) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate = new Date(today);
  let isMonthly = false;

  if (timeRange === "month") {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (timeRange === "year") {
    startDate = new Date(today.getFullYear(), 0, 1);
    isMonthly = true;
  } else {
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(today.getFullYear(), today.getMonth(), diff);
  }

  const dataMap = {};
  if (Array.isArray(apiData)) {
    apiData.forEach((item) => {
      dataMap[item.date] = item.revenue;
    });
  }

  const filledData = [];
  const currentDate = new Date(startDate);

  const endDate =
    timeRange === "year"
      ? new Date(today.getFullYear(), 11, 31)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate());

  while (currentDate <= endDate) {
    let key = "";
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth() + 1;
    const d = currentDate.getDate();

    if (isMonthly) {
      key = `${y}-${m < 10 ? `0${m}` : m}`;
    } else {
      key = `${y}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d}`;
    }

    filledData.push({
      date: key,
      revenue: dataMap[key] || 0,
    });

    if (isMonthly) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return filledData;
};

const CompactStatCard = ({
  title,
  value,
  growth,
  icon,
  colorClass,
  suffix,
}) => {
  const isPositive = growth >= 0;
  return (
    <div className="bg-white px-2 py-1.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between h-full transition-shadow hover:shadow-md">
      <div className="flex flex-col justify-center">
        <span className="text-gray-400 text-[9px] uppercase font-bold tracking-wider mb-0.5">
          {title}
        </span>
        <div className="flex items-baseline">
          <h3 className="text-base font-bold text-gray-800 leading-none">
            {formatCurrency(value)}
            {suffix && (
              <span className="text-[10px] font-normal text-gray-500 ml-0.5">
                {suffix}
              </span>
            )}
          </h3>
        </div>
        {growth !== undefined && (
          <div
            className={`flex items-center text-[9px] font-bold mt-0.5 ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <span className="ml-0.5">{Math.abs(growth)}%</span>
          </div>
        )}
      </div>

      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}
      >
        {React.cloneElement(icon, { className: "text-base" })}
      </div>
    </div>
  );
};

const Overview = () => {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    teachers: 0,
    languages: 0,
    registrations: { value: 0, growth: 0 },
    revenue: { value: 0, growth: 0 },
    newStudents: { value: 0, growth: 0 },
    revenueDetailed: [],
    topTeachers: [],
    topCourses: [],
    unpopularCourses: [],
  });
  const [revenueData, setRevenueData] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const { state } = useAuth();

  const renderStatusTag = (status) => {
    let color = "bg-gray-100 text-gray-500";
    let text = "Sắp diễn ra";
    if (status === "ongoing") {
      color = "bg-green-100 text-green-600";
      text = "Đang diễn ra";
    } else if (status === "finished") {
      color = "bg-red-50 text-red-500";
      text = "Đã kết thúc";
    } else {
      color = "bg-blue-50 text-blue-500";
    }
    return (
      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${color}`}>
        {text}
      </span>
    );
  };

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  useEffect(() => {
    if (state.currentUser?.role === "Admin") {
      setLoading(true);
      Promise.all([
        apiClient.get("/overview/stats", { params: { range: timeRange } }),
        apiClient.get("/overview/revenue-stats", {
          params: { range: timeRange },
        }),
      ])
        .then(([statsRes, revRes]) => {
          setStats(statsRes.data);
          const filled = fillChartData(revRes.data, timeRange);
          setRevenueData(filled);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [timeRange, state.currentUser]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden font-sans text-gray-800">
      <div className="px-5 py-1 bg-white border-b flex justify-between items-center shrink-0 h-10">
        <div>
          <h2 className="text-base font-extrabold text-gray-800 italic tracking-tight">
            DREAM DASHBOARD
          </h2>
        </div>
        <div className="bg-gray-100 px-2 py-0.5 rounded-full border flex items-center">
          <CalendarOutlined className="mr-2 text-gray-500 text-xs" />
          <Select
            value={timeRange}
            onChange={setTimeRange}
            variant="borderless"
            style={{ width: 120 }}
            size="small"
            className="font-medium text-xs"
          >
            <Select.Option value="week">Tuần này</Select.Option>
            <Select.Option value="month">Tháng này</Select.Option>
            <Select.Option value="year">Năm nay</Select.Option>
          </Select>
        </div>
      </div>

      <Spin
        spinning={loading}
        wrapperClassName="flex-1 flex flex-col h-full overflow-hidden"
      >
        <div className="flex-1 p-2 flex flex-col gap-2 overflow-hidden">
          <div className="grid grid-cols-7 gap-2 shrink-0 h-[56px]">
            <CompactStatCard
              title="Khóa học"
              value={stats.courses}
              icon={<ReadOutlined />}
              colorClass="bg-blue-50 text-blue-600"
            />
            <CompactStatCard
              title="Học viên"
              value={stats.students}
              icon={<UserOutlined />}
              colorClass="bg-indigo-50 text-indigo-600"
            />
            <CompactStatCard
              title="Giảng viên"
              value={stats.teachers}
              icon={<TeamOutlined />}
              colorClass="bg-orange-50 text-orange-600"
            />
            <CompactStatCard
              title="Ngôn ngữ"
              value={stats.languages}
              icon={<GlobalOutlined />}
              colorClass="bg-green-50 text-green-600"
            />
            <CompactStatCard
              title="Doanh thu"
              value={stats.revenue?.value}
              growth={stats.revenue?.growth}
              suffix="₫"
              icon={<DollarCircleOutlined />}
              colorClass="bg-emerald-50 text-emerald-600"
            />
            <CompactStatCard
              title="Đơn hàng"
              value={stats.registrations?.value}
              growth={stats.registrations?.growth}
              icon={<ProfileOutlined />}
              colorClass="bg-sky-50 text-sky-600"
            />
            <CompactStatCard
              title="HV Mới"
              value={stats.newStudents?.value}
              growth={stats.newStudents?.growth}
              icon={<UserAddOutlined />}
              colorClass="bg-pink-50 text-pink-600"
            />
          </div>

          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <div className="grid grid-cols-12 gap-2 h-[34vh] shrink-0">
              <div className="col-span-8 bg-white p-3 rounded-xl border shadow-sm flex flex-col">
                <h3 className="text-xs font-bold text-gray-700 mb-0 uppercase">
                  Biến Động Doanh Thu
                </h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueData}
                      margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="clr" x1="0" y1="0" x2="0" y2="1">
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
                        stroke="#f0f0f0"
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDateDisplay}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: "#6B7280" }}
                        interval="preserveStartEnd"
                      />
                      <YAxis hide domain={[0, "auto"]} />
                      <Tooltip
                        formatter={(value) => formatCurrency(value) + " ₫"}
                        labelFormatter={(label) =>
                          `Thời gian: ${formatDateDisplay(label)}`
                        }
                        contentStyle={{
                          fontSize: "11px",
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="url(#clr)"
                        activeDot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-span-4 bg-white p-3 rounded-xl border shadow-sm flex flex-col">
                <h3 className="text-xs font-bold text-center text-gray-700 mb-0 uppercase">
                  Cơ Cấu Doanh Thu
                </h3>
                <div className="flex-1 min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.revenueDetailed}
                        cx="50%"
                        cy="45%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.revenueDetailed.map((e, i) => (
                          <Cell
                            key={i}
                            fill={COLORS[i % COLORS.length]}
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => formatCurrency(val) + " ₫"}
                        contentStyle={{ fontSize: "10px" }}
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "9px", paddingTop: "0px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-2 h-[45vh] shrink-0 pb-1">
              <div className="col-span-4 bg-white p-3 rounded-xl border shadow-sm flex flex-col">
                <h3 className="text-xs font-bold text-gray-700 mb-1 flex items-center uppercase tracking-wide">
                  <TeamOutlined className="mr-1 text-indigo-500" /> Top Giáo
                  Viên
                </h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.topTeachers}
                      layout="vertical"
                      margin={{ left: -25, right: 10, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={90}
                        tick={{ fontSize: 9, fill: "#4B5563" }}
                        interval={0}
                      />
                      <Tooltip
                        cursor={{ fill: "#F3F4F6" }}
                        contentStyle={{ fontSize: "10px" }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#6366F1"
                        radius={[0, 4, 4, 0]}
                        barSize={10}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-span-4 bg-white p-3 rounded-xl border border-teal-50 shadow-sm flex flex-col">
                <h3 className="text-xs font-bold text-teal-700 mb-1 flex items-center uppercase tracking-wide">
                  <TrophyOutlined className="mr-1" /> Khóa Học Hot
                </h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.topCourses}
                      layout="vertical"
                      margin={{ left: -25, right: 10, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={90}
                        tick={{ fontSize: 9, fill: "#4B5563" }}
                        interval={0}
                      />
                      <Tooltip
                        cursor={{ fill: "#F0FDFA" }}
                        contentStyle={{ fontSize: "10px" }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#14B8A6"
                        radius={[0, 4, 4, 0]}
                        barSize={10}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-span-4 bg-white p-3 rounded-xl border border-red-50 shadow-sm flex flex-col">
                <h3 className="text-xs font-bold text-red-600 mb-2 flex items-center uppercase tracking-wide">
                  <ArrowDownOutlined className="mr-1" /> Cần Cải Thiện
                </h3>
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {stats.unpopularCourses &&
                  stats.unpopularCourses.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {stats.unpopularCourses.map((course, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col p-1.5 bg-gray-50 rounded border border-gray-100 hover:border-red-200 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[10px] font-mono text-gray-400 bg-white px-1 border rounded">
                              {course.courseid}
                            </span>
                            {renderStatusTag(course.status)}
                          </div>
                          <span
                            className="text-[12px] font-semibold text-gray-700 line-clamp-1"
                            title={course.name}
                          >
                            {course.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">
                      Không có dữ liệu
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default Overview;
