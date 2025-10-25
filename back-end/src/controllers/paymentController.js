const paymentService = require("../services/paymentService");
const RegistrationCourse = require("../models/RegistrationCourse");

// Tạo URL thanh toán
exports.createPaymentUrl = async (req, res) => {
  try {
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const { registrationId } = req.body;

    // Lấy thông tin đăng ký để biết số tiền cần thanh toán
    const registration = await RegistrationCourse.findById(registrationId).populate(
      "course_id",
      "Tuition"
    );
    if (!registration) {
      return res.status(404).json({ message: "Không tìm thấy lượt đăng ký" });
    }
    
    if (registration.isPaid) {
        return res.status(400).json({ message: "Đăng ký này đã được thanh toán" });
    }

    const amount = registration.course_id.Tuition;
    const paymentUrl = paymentService.createVnpayUrl(ipAddr, amount, registrationId);

    res.status(200).json({ url: paymentUrl });
  } catch (error) {
    console.error("Error creating payment URL:", error);
    res.status(500).json({ message: "Lỗi khi tạo URL thanh toán" });
  }
};

// Xử lý IPN
exports.vnpayIpn = async (req, res) => {
  try {
    // Tạo một bản sao của req.query thành một object JavaScript thông thường
    const vnp_Params = { ...req.query }; 
    
    // Gửi bản sao này đi xử lý
    const result = await paymentService.handleVnpayIpn(vnp_Params); 
    
    res.status(200).json(result);
  } catch (error) {
    console.error("IPN Error:", error);
    res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};