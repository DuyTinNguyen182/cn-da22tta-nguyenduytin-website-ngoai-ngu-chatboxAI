const authService = require('../services/authService');
const config = require('../config/jwt');
const jwtSecret = config.SECRET_KEY
const transporter = require('../config/mail');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require("path");
const fs = require("fs");

const register = async (req, res) => {    
    const { fullname } = req.body;
    if (fullname && /[^a-zA-ZÀ-ỹ\s]/.test(fullname)) {
      return res.status(400).json({ message: "Họ tên không hợp lệ" });
    }

    const { address } = req.body;    
    if (address && /[^a-zA-ZÀ-ỹ,/0-9\s]/.test(address)) {
      return res.status(400).json({ message: "Địa chỉ không hợp lệ" });
    }

    try {
        const result = await authService.registerUser(req.body);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        res.status(201).json({ message: result.message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body, jwtSecret);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        res.cookie('token', result.token, { httpOnly: true });
        res.json({ token: result.token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        res.json({ message: 'Logout successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Vui lòng nhập email!" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy email này!" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "15m" }
    );

    const resetLink = `${
      process.env.CLIENT_URL || "http://localhost:3000"
    }/reset-password?token=${token}`;

    // đọc template HTML
    const templatePath = path.join(__dirname, "../templates/forgotPassword.html");

    let html = fs.readFileSync(templatePath, "utf8");

    // thay biến
    html = html
      .replace(/{{fullname}}/g, user.fullname)
      .replace(/{{resetLink}}/g, resetLink);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "🔐 Yêu cầu đặt lại mật khẩu - Trung tâm ngoại ngữ DREAM",
      html,
    });

    res.json({ message: "Đã gửi link đặt lại mật khẩu tới email của bạn!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi gửi mail!" });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Thiếu token hoặc mật khẩu mới!' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token đã hết hạn, vui lòng gửi lại yêu cầu quên mật khẩu.' });
    }
    res.status(400).json({ message: 'Token không hợp lệ hoặc lỗi khác!' });
  }
};

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
};
