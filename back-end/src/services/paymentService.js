const crypto = require("crypto");
const qs = require("qs");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const RegistrationCourse = require("../models/RegistrationCourse");
const transporter = require("../config/mail"); // Import cấu hình mail

// --- HELPER: Bỏ dấu tiếng Việt ---
function removeVietnameseTones(str) {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

// --- HELPER: Sắp xếp tham số ---
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// --- SERVICE: Gửi Email Hóa Đơn ---
async function sendInvoiceEmail(registration) {
  try {
    const templatePath = path.join(__dirname, "../templates/invoice.html");

    // Kiểm tra file template có tồn tại không
    if (!fs.existsSync(templatePath)) {
      console.error("Không tìm thấy file template invoice.html");
      return;
    }

    let html = fs.readFileSync(templatePath, "utf8");

    // Format các dữ liệu để hiển thị
    const amountFormatted = new Intl.NumberFormat("vi-VN").format(
      registration.course_id.discounted_price
    );
    const paymentDateFormatted = moment(registration.paymentDate).format(
      "DD/MM/YYYY HH:mm:ss"
    );

    // Lấy thông tin lớp học an toàn
    const classInfo = registration.class_session_id
      ? `${registration.class_session_id.days} (${registration.class_session_id.time})`
      : "Đang cập nhật";

    // Lấy tên khóa học đầy đủ
    const language = registration.course_id.language_id?.language || "";
    const level = registration.course_id.languagelevel_id?.language_level || "";
    const courseName = `${language} - ${level}`;

    // Thay thế biến trong template
    html = html
      .replace("{{fullname}}", registration.user_id.fullname)
      .replace("{{userid}}", registration.user_id.userid)
      .replace("{{email}}", registration.user_id.email)
      .replace("{{orderId}}", registration._id)
      .replace("{{courseName}}", courseName)
      .replace("{{classTime}}", classInfo)
      .replace("{{paymentDate}}", paymentDateFormatted)
      .replace("{{amount}}", amountFormatted);

    // Gửi mail
    await transporter.sendMail({
      from: `"DREAM Education" <${process.env.GMAIL_USER}>`,
      to: registration.user_id.email,
      subject: "Hóa đơn thanh toán khóa học - Trung tâm ngoại ngữ DREAM",
      html: html,
    });

    console.log(`Đã gửi hóa đơn cho email: ${registration.user_id.email}`);
  } catch (error) {
    console.error("Lỗi gửi email hóa đơn:", error);
    // Không throw error để tránh làm ảnh hưởng luồng phản hồi IPN
  }
}

// --- SERVICE CHÍNH: Tạo URL thanh toán ---
async function createPaymentUrl(ipAddr, registrationId) {
  // Lấy thông tin từ Database
  const registration = await RegistrationCourse.findById(registrationId)
    .populate("course_id", "courseid Tuition discount_percent")
    .populate("user_id", "userid fullname");

  if (!registration) {
    throw new Error("Không tìm thấy lượt đăng ký");
  }

  if (registration.isPaid) {
    throw new Error("Đăng ký này đã được thanh toán");
  }

  // Chuẩn bị dữ liệu
  const amount = registration.course_id.discounted_price;
  const studentCode = registration.user_id?.userid || "";
  const studentName = removeVietnameseTones(
    registration.user_id?.fullname || ""
  );
  const courseId = registration.course_id.courseid;

  // Tạo nội dung: "HP [MaHV] [TenHV] [IDKhoahoc]"
  const orderInfo = `HP ${courseId} ${studentCode} ${studentName}`;

  // Cấu hình VNPay
  process.env.TZ = "Asia/Ho_Chi_Minh";
  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET;
  let vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");
  const orderId = registrationId.toString();

  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = "vn";
  vnp_Params["vnp_CurrCode"] = "VND";
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = orderInfo;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = Math.floor(amount * 100);
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;

  // Ký dữ liệu
  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

  return vnpUrl; // Trả về URL cuối cùng
}

// --- SERVICE: Xử lý IPN ---
async function handleVnpayIpn(vnp_Params) {
  const secureHash = vnp_Params["vnp_SecureHash"];
  const secretKey = process.env.VNP_HASHSECRET;
  const registrationId = vnp_Params["vnp_TxnRef"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash !== signed) {
    return { RspCode: "97", Message: "Invalid Signature" };
  }

  // --- CẬP NHẬT: Populate đầy đủ thông tin để gửi mail ---
  const registration = await RegistrationCourse.findById(registrationId)
    .populate({
      path: "course_id",
      populate: [{ path: "language_id" }, { path: "languagelevel_id" }],
    })
    .populate("user_id")
    .populate("class_session_id");
  // ------------------------------------------------------

  if (!registration) {
    return { RspCode: "01", Message: "Order not found" };
  }

  if (registration.isPaid) {
    return { RspCode: "02", Message: "Order already confirmed" };
  }

  if (vnp_Params["vnp_ResponseCode"] === "00") {
    registration.isPaid = true;
    registration.paymentDate = new Date(); // Cập nhật ngày thanh toán
    await registration.save();

    // --- GỌI HÀM GỬI EMAIL ---
    sendInvoiceEmail(registration);
    // -------------------------

    return { RspCode: "00", Message: "Confirm Success" };
  } else {
    return { RspCode: "99", Message: "Transaction failed" };
  }
}

module.exports = { createPaymentUrl, handleVnpayIpn };
