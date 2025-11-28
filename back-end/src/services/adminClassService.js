const RegistrationCourse = require("../models/RegistrationCourse");

const getClassStatistics = async () => {
  return await RegistrationCourse.aggregate([
    {
      $match: {
        class_session_id: { $exists: true, $ne: null },
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user_info",
      },
    },
    { $unwind: "$user_info" },

    {
      $group: {
        _id: {
          course: "$course_id",
          session: "$class_session_id",
          status: "$status",
        },
        student_count: { $sum: 1 },
        students_list: {
          $push: {
            _id: "$user_info._id",
            userid: "$user_info.userid",
            fullname: "$user_info.fullname",
            email: "$user_info.email",
            gender: "$user_info.gender",
            address: "$user_info.address",
            registration_date: "$enrollment_date",
            isPaid: "$isPaid",
          },
        },
      },
    },

    {
      $lookup: {
        from: "courses",
        localField: "_id.course",
        foreignField: "_id",
        as: "course_info",
      },
    },
    { $unwind: "$course_info" },

    {
      $lookup: {
        from: "classsessions",
        localField: "_id.session",
        foreignField: "_id",
        as: "session_info",
      },
    },
    { $unwind: "$session_info" },

    {
      $project: {
        _id: 0,
        course_id: "$_id.course",
        class_session_id: "$_id.session",

        course_name: "$course_info.courseid",
        Start_Date: "$course_info.Start_Date",

        days: "$session_info.days",
        time: "$session_info.time",
        status: "$_id.status",
        student_count: 1,

        students_list: 1,
      },
    },

    { $sort: { status: -1, student_count: -1 } },
  ]);
};

const updateClassStatus = async (
  courseId,
  sessionId,
  currentStatus,
  action
) => {
  let newStatus = "";
  if (action === "open") newStatus = "confirmed";
  else if (action === "cancel") newStatus = "cancelled";
  else throw new Error("Hành động không hợp lệ");

  const result = await RegistrationCourse.updateMany(
    {
      course_id: courseId,
      class_session_id: sessionId,
      status: currentStatus,
    },
    { $set: { status: newStatus } }
  );
  return result;
};

module.exports = {
  getClassStatistics,
  updateClassStatus,
};
