require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connect = require("./config/db");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cron = require("node-cron");
const registrationService = require("./services/registrationService");

cron.schedule("*/15 * * * *", async () => {
  console.log("--- Bắt đầu quét đơn chưa thanh toán ---");
  try {
    // Gọi hàm xóa đơn quá hạn
    await registrationService.deleteUnpaidRegistrations();
  } catch (error) {
    console.error("Lỗi Cron Job:", error);
  }
});

const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

// Danh sách các trang được phép gọi API
const allowedOrigins = [
  "http://localhost:5173", // Link Local
  "https://ngoai-ngu-dream.netlify.app", // Link Netlify
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(
  session({
    secret: "super_secret_key_123",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      // Nếu đang chạy trên Render (có biến PORT hoặc NODE_ENV) thì bật Secure, còn Local thì tắt
      secure:
        process.env.NODE_ENV === "production" || process.env.PORT
          ? true
          : false,

      // Trên mạng (khác domain) thì cần 'none', Local thì 'lax'
      sameSite:
        process.env.NODE_ENV === "production" || process.env.PORT
          ? "none"
          : "lax",

      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

connect();

app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/language", require("./routes/language"));
app.use("/api/languagelevel", require("./routes/languagelevel"));
app.use("/api/teacher", require("./routes/teacher"));
app.use("/api/course", require("./routes/course"));
app.use("/api/registration", require("./routes/registration"));
app.use("/api/overview", require("./routes/overview"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/coupon", require("./routes/coupon"));
app.use("/api/chatbot", require("./routes/chatbot"));
app.use("/api/review", require("./routes/review"));
app.use("/api/contacts", require("./routes/contact"));
app.use("/api/class-sessions", require("./routes/classSession"));
app.use("/api/admin/classes", require("./routes/adminClass"));
app.use("/api/slideshow", require("./routes/slideshow"));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
