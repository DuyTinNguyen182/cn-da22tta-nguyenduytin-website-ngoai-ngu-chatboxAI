const Course = require("../models/Course");
const Language = require("../models/Language");
const LanguageLevel = require("../models/Language_level");
const Teacher = require("../models/Teacher");
const User = require("../models/user");
const RegistrationCourse = require("../models/RegistrationCourse");

const getStartDate = (range = "week") => {
  const startDate = new Date();

  startDate.setUTCHours(0, 0, 0, 0);

  switch (range) {
    case "month":
      startDate.setUTCMonth(startDate.getUTCMonth() - 1);
      break;
    case "year":
      startDate.setUTCFullYear(startDate.getUTCFullYear() - 1);
      break;
    case "week":
    default:
      startDate.setUTCDate(startDate.getUTCDate() - 7);
      break;
  }
  return startDate;
};

const getOverviewStats = async (range) => {
  const startDate = getStartDate(range);

  const totalCourses = await Course.countDocuments();
  const totalLanguages = await Language.countDocuments();
  const totalLevels = await LanguageLevel.countDocuments();
  const totalTeachers = await Teacher.countDocuments();
  const totalStudents = await User.countDocuments({ role: "Student" });

  const timeFilter = { createdAt: { $gte: startDate } };

  const registrationsInRange = await RegistrationCourse.countDocuments(
    timeFilter
  );
  const newStudentsInRange = await User.countDocuments({
    role: "Student",
    ...timeFilter,
  });

  const revenuePipeline = [
    { $match: { isPaid: true, ...timeFilter } },
    {
      $lookup: {
        from: "courses",
        localField: "course_id",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
    { $group: { _id: null, totalRevenue: { $sum: "$courseDetails.Tuition" } } },
  ];
  const revenueResult = await RegistrationCourse.aggregate(revenuePipeline);
  const revenueInRange =
    revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  const topCoursesPipeline = [
    { $group: { _id: "$course_id", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "courseInfo",
      },
    },
    { $unwind: "$courseInfo" },
    { $project: { name: "$courseInfo.courseid", count: "$count" } },
  ];
  const topCourses = await RegistrationCourse.aggregate(topCoursesPipeline);

  // const revenueByLanguage = await RegistrationCourse.aggregate([
  //   { $match: { isPaid: true } },
  //   {
  //     $lookup: {
  //       from: "courses",
  //       localField: "course_id",
  //       foreignField: "_id",
  //       as: "course",
  //     },
  //   },
  //   { $unwind: "$course" },
  //   {
  //     $lookup: {
  //       from: "languages",
  //       localField: "course.language_id",
  //       foreignField: "_id",
  //       as: "lang",
  //     },
  //   },
  //   { $unwind: "$lang" },
  //   {
  //     $group: {
  //       _id: "$lang.language",
  //       value: { $sum: "$course.Tuition" },
  //     },
  //   },
  //   { $project: { name: "$_id", value: 1, _id: 0 } },
  // ]);
  const revenueDetailed = await RegistrationCourse.aggregate([
    { $match: { isPaid: true } }, // Tính trên toàn bộ lịch sử để vẽ biểu đồ cơ cấu
    {
      $lookup: {
        from: "courses",
        localField: "course_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    // Lookup Ngôn ngữ
    {
      $lookup: {
        from: "languages",
        localField: "course.language_id",
        foreignField: "_id",
        as: "lang",
      },
    },
    { $unwind: "$lang" },
    // Lookup Trình độ (Lưu ý: Collection trong MongoDB thường là số nhiều 'language_levels')
    {
      $lookup: {
        from: "language_levels",
        localField: "course.languagelevel_id",
        foreignField: "_id",
        as: "lvl",
      },
    },
    { $unwind: "$lvl" },
    {
      $group: {
        // Gom nhóm theo cặp (Ngôn ngữ - Trình độ)
        _id: { lang: "$lang.language", lvl: "$lvl.language_level" },
        value: { $sum: "$course.Tuition" },
      },
    },
    {
      $project: {
        // Nối chuỗi tạo thành tên hiển thị: "Tiếng Anh - A1"
        name: { $concat: ["$_id.lang", " - ", "$_id.lvl"] },
        value: 1,
        _id: 0,
      },
    },
    { $sort: { value: -1 } }, // Sắp xếp doanh thu từ cao xuống thấp
    { $limit: 5 },
  ]);

  const topTeachers = await RegistrationCourse.aggregate([
    { $group: { _id: "$course_id", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $group: { _id: "$course.teacher_id", totalStudents: { $sum: "$count" } },
    },
    { $sort: { totalStudents: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "teachers",
        localField: "_id",
        foreignField: "_id",
        as: "teacher",
      },
    },
    { $unwind: "$teacher" },
    {
      $project: { name: "$teacher.full_name", count: "$totalStudents", _id: 0 },
    },
  ]);

  return {
    courses: totalCourses,
    languages: totalLanguages,
    levels: totalLevels,
    students: totalStudents,
    teachers: totalTeachers,
    topCourses: topCourses,
    registrations: registrationsInRange,
    revenue: revenueInRange,
    newStudents: newStudentsInRange,
    // revenueByLanguage,
    revenueDetailed,
    topTeachers,
  };
};

const getRevenueOverTime = async (range) => {
  const startDate = getStartDate(range);

  const groupFormat = range === "year" ? "%Y-%m" : "%Y-%m-%d";

  const revenuePipeline = [
    { $match: { isPaid: true, paymentDate: { $gte: startDate } } },
    {
      $lookup: {
        from: "courses",
        localField: "course_id",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupFormat,
            date: "$paymentDate",
            timezone: "+07:00",
          },
        },
        totalRevenue: { $sum: "$courseDetails.Tuition" },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", revenue: "$totalRevenue" } },
  ];

  return await RegistrationCourse.aggregate(revenuePipeline);
};

module.exports = {
  getOverviewStats,
  getRevenueOverTime,
};
