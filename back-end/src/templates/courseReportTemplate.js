const fillCourseStudentSheet = (workbook, course, registrations) => {
  const worksheet = workbook.addWorksheet("Danh sách học viên");

  // --- PHẦN 1: HEADER THÔNG TIN KHÓA HỌC ---
  worksheet.mergeCells("A1:H1");
  const titleRow = worksheet.getCell("A1");
  titleRow.value = "DANH SÁCH HỌC VIÊN ĐĂNG KÝ KHÓA HỌC";
  titleRow.font = { name: "Arial", size: 16, bold: true };
  titleRow.alignment = { vertical: "middle", horizontal: "center" };

  // Dòng 3: Tên khóa - Ngôn ngữ - Trình độ
  worksheet.getCell("A3").value = "Tên khóa học:";
  worksheet.getCell("B3").value = course.courseid || "N/A";

  worksheet.getCell("C3").value = "Ngôn ngữ:";
  worksheet.getCell("D3").value = course.language_id?.language || "";

  worksheet.getCell("E3").value = "Trình độ:";
  worksheet.getCell("F3").value = course.languagelevel_id?.language_level || "";

  // Dòng 4: Ngày bắt đầu - Ngày kết thúc - Số tiết
  worksheet.getCell("A4").value = "Ngày bắt đầu:";
  worksheet.getCell("B4").value = course.Start_Date
    ? new Date(course.Start_Date).toLocaleDateString("vi-VN")
    : "";

  worksheet.getCell("C4").value = "Ngày kết thúc:";
  worksheet.getCell("D4").value = course.end_date
    ? new Date(course.end_date).toLocaleDateString("vi-VN")
    : "";

  worksheet.getCell("E4").value = "Số tiết:";
  worksheet.getCell("F4").value = course.Number_of_periods || 0;

  // Style in đậm cho tiêu đề field
  ["A3", "C3", "E3", "A4", "C4", "E4"].forEach((cell) => {
    worksheet.getCell(cell).font = { bold: true };
  });

  // --- PHẦN 2: BẢNG DANH SÁCH HỌC VIÊN ---
  // Định nghĩa cột (bắt đầu từ dòng 6)
  const headerRow = worksheet.getRow(6);
  headerRow.values = [
    "Mã HV",
    "Họ và Tên",
    "Giới tính",
    "Email",
    "Địa chỉ",
    "Buổi học",
    "Ngày đăng ký",
    "Ngày thanh toán",
  ];

  // Style cho Header Bảng
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1890FF" }, // Màu xanh chủ đạo
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Đổ dữ liệu
  registrations.forEach((reg) => {
    const user = reg.user_id;
    const session = reg.class_session_id;

    // Format buổi học
    const sessionStr = session
      ? `${session.days} (${session.time})`
      : "Chưa xếp";

    // Format ngày thanh toán
    const paymentDate =
      reg.isPaid && reg.paymentDate
        ? new Date(reg.paymentDate).toLocaleDateString("vi-VN")
        : reg.isPaid
        ? "Đã thanh toán"
        : "Chưa đóng";

    const row = worksheet.addRow([
      user?.userid || "",
      user?.fullname || "",
      user?.gender || "",
      user?.email || "",
      user?.address || "",
      sessionStr,
      new Date(reg.createdAt).toLocaleDateString("vi-VN"),
      paymentDate,
    ]);

    // Border cho từng ô dữ liệu
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Auto width tương đối
  worksheet.columns = [
    { width: 15 }, // Mã HV
    { width: 25 }, // Tên
    { width: 10 }, // Giới tính
    { width: 25 }, // Email
    { width: 30 }, // Địa chỉ
    { width: 20 }, // Buổi học
    { width: 15 }, // Ngày ĐK
    { width: 15 }, // Ngày TT
  ];

  return worksheet;
};

module.exports = { fillCourseStudentSheet };
