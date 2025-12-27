const Course = require("../models/Course");
const Language = require("../models/Language");
const LanguageLevel = require("../models/Language_level");
const Teacher = require("../models/Teacher");
const User = require("../models/user");
const RegistrationCourse = require("../models/RegistrationCourse");

const getDateRanges = (range = "week") => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  let currentStart, prevStart, prevEnd;

  if (range === "month") {
    currentStart = new Date(today.getFullYear(), today.getMonth(), 1);
    prevStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    prevEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    prevEnd.setHours(23, 59, 59, 999);
  } else if (range === "year") {
    currentStart = new Date(today.getFullYear(), 0, 1);
    prevStart = new Date(today.getFullYear() - 1, 0, 1);
    prevEnd = new Date(today.getFullYear() - 1, 11, 31);
    prevEnd.setHours(23, 59, 59, 999);
  } else {
    const dayOfWeek = today.getDay(); // 0 (CN) - 6 (T7)
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    currentStart = new Date(today);
    currentStart.setDate(today.getDate() - diffToMonday);

    prevStart = new Date(currentStart);
    prevStart.setDate(currentStart.getDate() - 7);

    prevEnd = new Date(currentStart);
    prevEnd.setTime(prevEnd.getTime() - 1);
  }

  return { currentStart, prevStart, prevEnd };
};

const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const getOverviewStats = async (range) => {
  const { currentStart, prevStart, prevEnd } = getDateRanges(range);

  const [
    totalCourses,
    totalLanguages,
    totalLevels,
    totalTeachers,
    totalStudents,
  ] = await Promise.all([
    Course.countDocuments(),
    Language.countDocuments(),
    LanguageLevel.countDocuments(),
    Teacher.countDocuments(),
    User.countDocuments({ role: "Student" }),
  ]);

  const getPeriodData = async (start, end) => {
    const filter = {
      createdAt: { $gte: start, ...(end ? { $lte: end } : {}) },
    };

    const regs = await RegistrationCourse.countDocuments(filter);
    const newStuds = await User.countDocuments({ role: "Student", ...filter });

    const revRes = await RegistrationCourse.aggregate([
      { $match: { isPaid: true, ...filter } },
      {
        $lookup: {
          from: "courses",
          localField: "course_id",
          foreignField: "_id",
          as: "c",
        },
      },
      { $unwind: "$c" },
      { $group: { _id: null, total: { $sum: "$c.Tuition" } } },
    ]);

    return { regs, newStuds, revenue: revRes[0]?.total || 0 };
  };

  const currentData = await getPeriodData(currentStart);
  const prevData = await getPeriodData(prevStart, prevEnd);

  const revenueDetailed = await RegistrationCourse.aggregate([
    { $match: { isPaid: true } },
    {
      $lookup: {
        from: "courses",
        localField: "course_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $lookup: {
        from: "languages",
        localField: "course.language_id",
        foreignField: "_id",
        as: "lang",
      },
    },
    { $unwind: "$lang" },
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
        _id: { lang: "$lang.language", lvl: "$lvl.language_level" },
        value: { $sum: "$course.Tuition" },
      },
    },
    {
      $project: {
        name: { $concat: ["$_id.lang", " - ", "$_id.lvl"] },
        value: 1,
        _id: 0,
      },
    },
    { $sort: { value: -1 } },
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

  const topCourses = await RegistrationCourse.aggregate([
    { $group: { _id: "$course_id", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "c",
      },
    },
    { $unwind: "$c" },
    {
      $lookup: {
        from: "languages",
        localField: "c.language_id",
        foreignField: "_id",
        as: "l",
      },
    },
    { $unwind: "$l" },
    {
      $lookup: {
        from: "language_levels",
        localField: "c.languagelevel_id",
        foreignField: "_id",
        as: "lvl",
      },
    },
    { $unwind: "$lvl" },
    {
      $group: {
        _id: { lang: "$l.language", lvl: "$lvl.language_level" },
        studentCount: { $sum: "$count" },
      },
    },
    {
      $project: {
        name: { $concat: ["$_id.lang", " ", "$_id.lvl"] },
        count: "$studentCount",
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const unpopularCourses = await Course.aggregate([
    {
      $lookup: {
        from: "registration_courses",
        localField: "_id",
        foreignField: "course_id",
        as: "regs",
      },
    },
    { $match: { regs: { $size: 0 } } },
    { $limit: 5 },
    {
      $lookup: {
        from: "languages",
        localField: "language_id",
        foreignField: "_id",
        as: "lang",
      },
    },
    { $unwind: "$lang" },
    {
      $lookup: {
        from: "language_levels",
        localField: "languagelevel_id",
        foreignField: "_id",
        as: "lvl",
      },
    },
    { $unwind: "$lvl" },
    {
      $project: {
        courseid: 1,
        name: { $concat: ["$lang.language", " - ", "$lvl.language_level"] },
        Start_Date: 1,
        end_date: 1,
      },
    },
  ]);

  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));

  const formattedUnpopular = unpopularCourses.map((c) => {
    const start = new Date(c.Start_Date);
    const end = new Date(c.end_date);
    end.setHours(23, 59, 59, 999);

    let status = "upcoming";
    if (now > end) {
      status = "finished";
    } else if (todayStart >= start) {
      status = "ongoing";
    }

    return {
      ...c,
      status,
    };
  });

  return {
    courses: totalCourses,
    languages: totalLanguages,
    levels: totalLevels,
    students: totalStudents,
    teachers: totalTeachers,
    registrations: {
      value: currentData.regs,
      growth: calculateGrowth(currentData.regs, prevData.regs),
    },
    revenue: {
      value: currentData.revenue,
      growth: calculateGrowth(currentData.revenue, prevData.revenue),
    },
    newStudents: {
      value: currentData.newStuds,
      growth: calculateGrowth(currentData.newStuds, prevData.newStuds),
    },
    revenueDetailed,
    topTeachers,
    topCourses,
    unpopularCourses: formattedUnpopular,
  };
};

const getRevenueOverTime = async (range) => {
  const { currentStart } = getDateRanges(range);
  const groupFormat = range === "year" ? "%Y-%m" : "%Y-%m-%d";

  return await RegistrationCourse.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: currentStart } } },
    {
      $lookup: {
        from: "courses",
        localField: "course_id",
        foreignField: "_id",
        as: "c",
      },
    },
    { $unwind: "$c" },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupFormat,
            date: "$createdAt",
            timezone: "+07:00",
          },
        },
        totalRevenue: { $sum: "$c.Tuition" },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", revenue: "$totalRevenue" } },
  ]);
};

module.exports = { getOverviewStats, getRevenueOverTime };
