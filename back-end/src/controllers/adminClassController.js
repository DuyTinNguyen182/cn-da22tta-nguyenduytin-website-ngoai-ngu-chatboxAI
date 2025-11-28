const adminClassService = require("../services/adminClassService");

const getStats = async (req, res) => {
  try {
    const stats = await adminClassService.getClassStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const decideClass = async (req, res) => {
  try {
    const { course_id, class_session_id, current_status, action } = req.body;

    if (!course_id || !class_session_id || !action) {
      return res.status(400).json({ message: "Thiếu thông tin xử lý." });
    }

    const result = await adminClassService.updateClassStatus(
      course_id,
      class_session_id,
      current_status || "pending",
      action
    );

    res.json({
      message:
        action === "open" ? "Đã mở lớp thành công!" : "Đã hủy lớp thành công!",
      updated: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = { getStats, decideClass };
