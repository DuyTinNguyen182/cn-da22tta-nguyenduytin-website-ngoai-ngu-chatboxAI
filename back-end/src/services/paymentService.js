const crypto = require("crypto");
const qs = require("qs");
const moment = require("moment");
const RegistrationCourse = require("../models/RegistrationCourse");

// Tạo URL thanh toán VNPay
function createVnpayUrl(ipAddr, amount, registrationId) {
  process.env.TZ = "Asia/Ho_Chi_Minh";

  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET;
  let vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");

  const orderId = registrationId.toString();
  const orderInfo = `Thanh toan khoa hoc. Ma dang ky: ${orderId}`;
  const orderType = "other";
  const locale = "vn";
  const currCode = "VND";

  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = orderInfo;
  vnp_Params["vnp_OrderType"] = orderType;
  vnp_Params["vnp_Amount"] = amount * 100; // VNPay tính bằng đơn vị đồng * 100
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });
  return vnpUrl;
}

// Xử lý kết quả IPN từ VNPay
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

  const registration = await RegistrationCourse.findById(registrationId);
  if (!registration) {
    return { RspCode: "01", Message: "Order not found" };
  }

  if (registration.isPaid) {
    return { RspCode: "02", Message: "Order already confirmed" };
  }
  
  const amountFromVnpay = Number(vnp_Params['vnp_Amount']) / 100;

  if (vnp_Params["vnp_ResponseCode"] === "00") {
    registration.isPaid = true;
    await registration.save();
    return { RspCode: "00", Message: "Confirm Success" };
  } else {
    return { RspCode: "99", Message: "Transaction failed" };
  }
}

// Hàm helper để sắp xếp object
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

module.exports = { createVnpayUrl, handleVnpayIpn };