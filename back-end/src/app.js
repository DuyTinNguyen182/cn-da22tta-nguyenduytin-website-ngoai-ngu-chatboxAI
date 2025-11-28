require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connect = require("./config/db");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  session({
    secret: "super_secret_key_123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Để chạy trên http (localhost)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
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
app.use("/api/chatbot", require("./routes/chatbot"));
app.use("/api/review", require("./routes/review"));
app.use("/api/contacts", require("./routes/contact"));
app.use("/api/class-sessions", require("./routes/classSession"));
app.use("/api/admin/classes", require("./routes/adminClass"));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
