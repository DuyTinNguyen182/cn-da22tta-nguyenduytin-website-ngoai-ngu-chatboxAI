// back-end/src/services/overviewService.js

const Course = require("../models/Course");
const Language = require("../models/Language");
const LanguageLevel = require("../models/Language_level");
const Teacher = require("../models/Teacher");
const User = require("../models/user");
const RegistrationCourse = require("../models/RegistrationCourse");

// HÀM HELPER ĐỂ LẤY NGÀY BẮT ĐẦU
const getStartDate = (range = 'week') => {
  const startDate = new Date();
  
  //Reset giờ, phút, giây về đầu ngày để so sánh chính xác hơn
  startDate.setUTCHours(0, 0, 0, 0); 

  switch (range) {
    case 'month':
      // Dùng setUTCMonth để tránh các vấn đề về timezone
      startDate.setUTCMonth(startDate.getUTCMonth() - 1);
      break;
    case 'year':
      startDate.setUTCFullYear(startDate.getUTCFullYear() - 1);
      break;
    case 'week':
    default:
      startDate.setUTCDate(startDate.getUTCDate() - 7);
      break;
  }
  return startDate;
};

const getOverviewStats = async (range) => {
  const startDate = getStartDate(range);

  // --- Các thống kê không phụ thuộc thời gian (tính tổng) ---
  const totalCourses = await Course.countDocuments();
  const totalLanguages = await Language.countDocuments();
  const totalLevels = await LanguageLevel.countDocuments();
  const totalTeachers = await Teacher.countDocuments();
  const totalStudents = await User.countDocuments({ role: "Student" });

  // --- Các thống kê phụ thuộc thời gian ---
  const timeFilter = { createdAt: { $gte: startDate } };
  
  const registrationsInRange = await RegistrationCourse.countDocuments(timeFilter);
  const newStudentsInRange = await User.countDocuments({ role: "Student", ...timeFilter });

  // Doanh thu trong khoảng thời gian
  const revenuePipeline = [
    { $match: { isPaid: true, ...timeFilter } },
    { $lookup: { from: 'courses', localField: 'course_id', foreignField: '_id', as: 'courseDetails' } },
    { $unwind: '$courseDetails' },
    { $group: { _id: null, totalRevenue: { $sum: "$courseDetails.Tuition" } } }
  ];
  const revenueResult = await RegistrationCourse.aggregate(revenuePipeline);
  const revenueInRange = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  // Lấy top 5 khóa học được đăng ký nhiều nhất (không phụ thuộc thời gian)
  const topCoursesPipeline = [
    { $group: { _id: "$course_id", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'courseInfo' } },
    { $unwind: '$courseInfo' },
    { $project: { name: '$courseInfo.courseid', count: '$count' } }
  ];
  const topCourses = await RegistrationCourse.aggregate(topCoursesPipeline);

  return {
    // Tổng
    courses: totalCourses,
    languages: totalLanguages,
    levels: totalLevels,
    students: totalStudents,
    teachers: totalTeachers,
    topCourses: topCourses,
    // Theo khoảng thời gian
    registrations: registrationsInRange,
    revenue: revenueInRange,
    newStudents: newStudentsInRange,
  };
};

const getRevenueOverTime = async (range) => {
  const startDate = getStartDate(range);
  
  // Thay đổi định dạng group theo ngày (cho tuần/tháng) hoặc theo tháng (cho năm)
  const groupFormat = range === 'year' ? "%Y-%m" : "%Y-%m-%d";

  const revenuePipeline = [
    { $match: { isPaid: true, createdAt: { $gte: startDate } } },
    { $lookup: { from: 'courses', localField: 'course_id', foreignField: '_id', as: 'courseDetails' } },
    { $unwind: '$courseDetails' },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
        totalRevenue: { $sum: '$courseDetails.Tuition' },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', revenue: '$totalRevenue' } },
  ];

  return await RegistrationCourse.aggregate(revenuePipeline);
};

module.exports = {
  getOverviewStats,
  getRevenueOverTime,
};