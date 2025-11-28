const classSessionService = require("../services/classSessionService");

const createSession = async (req, res) => {
  try {
    const { days, time } = req.body;
    if (!days || !time) {
      return res.status(400).json({ message: "Vui lòng nhập Thứ và Giờ học." });
    }
    const session = await classSessionService.createSession(req.body);
    res.status(201).json({ message: "Thêm buổi học thành công", session });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const getAllSessions = async (req, res) => {
  try {
    const sessions = await classSessionService.getAllSessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    await classSessionService.deleteSession(req.params.id);
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const deleteMultipleSessions = async (req, res) => {
  try {
    const { ids } = req.body;
    await classSessionService.deleteMultipleSessions(ids);
    res.json({ message: "Xóa các mục đã chọn thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  createSession,
  getAllSessions,
  deleteSession,
  deleteMultipleSessions,
};
