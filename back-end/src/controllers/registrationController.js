const mongoose = require("mongoose");
const registrationService = require("../services/registrationService");

// --- Helper kiểm tra ObjectId hợp lệ ---
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Đăng ký khóa học
const registerCourse = async (req, res) => {
  try {
    const { user_id, course_id, class_session_id, payment_method, coupon_id } =
      req.body;

    if (!user_id || !course_id || !class_session_id)
      return res
        .status(400)
        .json({ message: "Thiếu thông tin (User, Khóa học hoặc Buổi học)" });

    const result = await registrationService.registerCourse({
      user_id,
      course_id,
      class_session_id,
      payment_method,
      coupon_id,
    });

    if (result.status === "already_registered") {
      return res.status(400).json({ message: "Đã đăng ký khóa học này rồi" });
    }

    res.status(201).json({
      message: "Đăng ký khóa học thành công",
      registration: result.registration,
    });
  } catch (err) {
    console.error("registerCourse error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy danh sách khóa học của user
const getCoursesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId))
      return res.status(400).json({ message: "userId không hợp lệ" });

    const registrations = await registrationService.getCoursesByUser(userId);
    res.json(registrations);
  } catch (err) {
    console.error("getCoursesByUser error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy danh sách học viên theo khóa học
const getUsersByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!isValidObjectId(courseId))
      return res.status(400).json({ message: "courseId không hợp lệ" });

    const registrations = await registrationService.getUsersByCourse(courseId);
    res.json(registrations);
  } catch (err) {
    console.error("getUsersByCourse error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy tất cả đăng ký (admin)
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await registrationService.getAllRegistrations();
    res.json(registrations);
  } catch (err) {
    console.error("getAllRegistrations error:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách đăng ký" });
  }
};

// Lấy đăng ký theo ID
const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "ID không hợp lệ" });

    const reg = await registrationService.getRegistrationById(id);
    if (!reg)
      return res.status(404).json({ message: "Không tìm thấy đăng ký" });

    res.json(reg);
  } catch (err) {
    console.error("getRegistrationById error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Hủy đăng ký
const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "ID không hợp lệ" });

    const success = await registrationService.cancelRegistration(id);
    if (!success)
      return res.status(404).json({ message: "Không tìm thấy đăng ký" });

    res.json({ message: "Hủy đăng ký thành công" });
  } catch (err) {
    console.error("cancelRegistration error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

const deleteMultipleRegistrations = async (req, res) => {
  try {
    const { registrationIds } = req.body;
    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res
        .status(400)
        .json({ message: "registrationIds phải là một mảng không rỗng." });
    }

    for (const id of registrationIds) {
      if (!isValidObjectId(id)) {
        return res.status(400).json({ message: `ID không hợp lệ: ${id}` });
      }
    }

    await registrationService.deleteManyRegistrations(registrationIds);
    res.json({ message: "Đã xóa các đăng ký thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật đăng ký (status/score)
const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "ID không hợp lệ" });

    const updated = await registrationService.updateRegistration(id, req.body);
    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy đăng ký" });

    res.json({ message: "Cập nhật thành công", updated });
  } catch (err) {
    console.error("updateRegistration error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Người dùng tự thực hiện thanh toán
const processUserPayment = async (req, res) => {
  try {
    const registrationId = req.params.id;
    const userId = req.user.id;

    if (!isValidObjectId(registrationId)) {
      return res.status(400).json({ message: "ID đăng ký không hợp lệ" });
    }

    const updated = await registrationService.updatePaymentStatus(
      registrationId,
      userId
    );

    if (!updated) {
      return res.status(404).json({
        message:
          "Không tìm thấy lượt đăng ký hoặc bạn không có quyền thực hiện.",
      });
    }
    res
      .status(200)
      .json({ message: "Thanh toán thành công!", registration: updated });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Admin xác nhận thanh toán
const confirmPaymentByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    const updated = await registrationService.updatePaymentStatus(
      id,
      null,
      true
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy đăng ký" });
    }
    res.status(200).json({
      message: "Xác nhận thanh toán thành công",
      registration: updated,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

const exportExcel = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sessionId } = req.query;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ message: "courseId không hợp lệ" });
    }

    // Kiểm tra sessionId hợp lệ trước khi truyền vào service
    const validSessionId = isValidObjectId(sessionId) ? sessionId : null;

    // Gọi Service để tạo workbook
    const { workbook, courseCode } =
      await registrationService.generateCourseStudentExcel(
        courseId,
        validSessionId
      );

    // Thiết lập Header cho Response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    // Xử lý tên file
    const safeFileName = `Danh_Sach_HV_${courseCode}`.replace(
      /[^a-zA-Z0-9-_]/g,
      "_"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${safeFileName}.xlsx`
    );

    // Ghi dữ liệu ra Response và kết thúc
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportExcel error:", err);
    // Chỉ trả về JSON lỗi nếu Header chưa được gửi
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Lỗi khi xuất file Excel", error: err.message });
    }
  }
};

module.exports = {
  registerCourse,
  getCoursesByUser,
  getUsersByCourse,
  getAllRegistrations,
  getRegistrationById,
  cancelRegistration,
  deleteMultipleRegistrations,
  updateRegistration,
  processUserPayment,
  confirmPaymentByAdmin,
  exportExcel,
};
