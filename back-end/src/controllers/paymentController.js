const paymentService = require("../services/paymentService");

// Tạo URL thanh toán
exports.createPaymentUrl = async (req, res) => {
  try {
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const { registrationId } = req.body;
    const paymentUrl = await paymentService.createPaymentUrl(
      ipAddr,
      registrationId
    );

    res.status(200).json({ url: paymentUrl });
  } catch (error) {
    console.error("Error creating payment URL:", error);
    res
      .status(500)
      .json({ message: error.message || "Lỗi khi tạo URL thanh toán" });
  }
};

exports.vnpayIpn = async (req, res) => {
  try {
    const vnp_Params = { ...req.query };
    const result = await paymentService.handleVnpayIpn(vnp_Params);
    res.status(200).json(result);
  } catch (error) {
    console.error("IPN Error:", error);
    res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};
exports.completeCashPayment = async (req, res) => {
  try {
    const { registrationId } = req.body;
    const result = await paymentService.handleCashPayment(registrationId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi xác nhận tiền mặt:", error);
    res.status(400).json({ message: error.message || "Lỗi server" });
  }
};
