const mongoose = require('mongoose');
// Nạp các biến môi trường từ file .env
// require('dotenv').config();

async function connect() {
    try {
        // Lấy chuỗi kết nối từ biến môi trường
        const uri = process.env.DATABASE_URL;

        // Kiểm tra xem biến môi trường đã được đặt chưa
        if (!uri) {
            console.log(uri);
            console.error("Lỗi: Biến môi trường DATABASE_URL chưa được thiết lập.");
            process.exit(1); // Thoát ứng dụng nếu không có chuỗi kết nối
        }

        await mongoose.connect(uri);
        console.log("Connected to MongoDB Atlas Successfully!");

    } catch (err) {
        console.error("Connected to DB Failure!");
        console.error(err);
    }
}

module.exports = connect;