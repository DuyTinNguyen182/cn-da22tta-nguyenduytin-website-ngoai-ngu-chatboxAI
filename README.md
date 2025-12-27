# XÂY DỰNG WEBSITE ĐĂNG KÝ HỌC NGOẠI NGỮ TÍCH HỢP TRỢ LÝ ẢO AI

> **Sinh viên thực hiện:** Nguyễn Duy Tín  
> **Lớp:** DA22TTA  
> **MSSV:** 110122182  
> **Đề tài:** Xây dựng website đăng ký học ngoại ngữ tích hợp trợ lý ảo AI hỗ trợ tư vấn khóa học

## 📖 Giới thiệu

Dự án là hệ thống website quản lý và đăng ký khóa học ngoại ngữ, tích hợp Chatbox AI (OpenAI) để tư vấn tự động, thanh toán online qua VNPay và xác thực Google.

**Công nghệ sử dụng:**

- **Front-end:** ReactJS, Vite.
- **Back-end:** NodeJS, ExpressJS.
- **Database:** MongoDB.
- **Dịch vụ bên thứ 3:** OpenAI, VNPay, Cloudinary, Google OAuth.

---

## 🛠️ Yêu cầu cài đặt (Prerequisites)

- [Node.js](https://nodejs.org/) (v16+).
- [Git](https://git-scm.com/).
- [MongoDB](https://www.mongodb.com/try/download/compass) (Local hoặc tài khoản MongoDB Atlas).

---

## 🚀 Hướng dẫn cài đặt & Cấu hình

### 1. Clone dự án

```bash
git clone https://github.com/DuyTinNguyen182/cn-da22tta-nguyenduytin-website-ngoai-ngu-chatboxAI.git
cd cn-da22tta-nguyenduytin-website-ngoai-ngu-chatboxAI

```

### 2. Cấu hình Back-end (Server)

Di chuyển vào thư mục `back-end` và cài đặt thư viện:

```bash
cd back-end
npm install

```

**Tạo file `.env`** :
Tại thư mục `back-end`, tạo file `.env` và điền các thông số tương ứng của bạn vào (dựa trên mẫu dưới đây):

```env
# --- CẤU HÌNH SERVER ---
PORT=3005
SECRET_KEY=chuoi_bi_mat_cua_ban
CLIENT_URL=http://localhost:5173

# --- KẾT NỐI DATABASE (Chọn 1 trong 2) ---
# Nếu dùng MongoDB cài trên máy:
MONGO_URI=mongodb://127.0.0.1:27017/Language_course
# Nếu dùng MongoDB Atlas (Cloud):
DATABASE_URL=mongodb+srv://user:pass@cluster...

# --- XÁC THỰC (JWT & GOOGLE) ---
JWT_SECRET=chuoi_bi_mat_cho_jwt
GOOGLE_CLIENT_ID=lay_tu_google_cloud_console

# --- GỬI EMAIL (NODEMAILER) ---
GMAIL_USER=email_cua_ban@gmail.com
# Lưu ý: Đây là App Password (mật khẩu ứng dụng), không phải mật khẩu đăng nhập Gmail
GMAIL_PASS=mat_khau_ung_dung_16_ky_tu

# --- UPLOAD ẢNH (CLOUDINARY) ---
CLOUDINARY_CLOUD_NAME=ten_cloud_cua_ban
CLOUDINARY_API_KEY=api_key_cua_ban
CLOUDINARY_API_SECRET=api_secret_cua_ban

# --- AI CHATBOT (OPENAI) ---
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx

# --- THANH TOÁN (VNPAY - Môi trường Sandbox) ---
VNP_TMNCODE=ma_tmn_code_test
VNP_HASHSECRET=secret_key_vnpay_test
VNP_URL=[https://sandbox.vnpayment.vn/paymentv2/vpcpay.html](https://sandbox.vnpayment.vn/paymentv2/vpcpay.html)
VNP_API=[https://sandbox.vnpayment.vn/merchant_webapi/api/transaction](https://sandbox.vnpayment.vn/merchant_webapi/api/transaction)
VNP_RETURN_URL=http://localhost:5173/payment-result

```

Chạy Server:

```bash
node src/app.js

```

### 3. Cấu hình Front-end (Client)

Mở terminal mới, di chuyển vào thư mục `front-end` và cài đặt:

```bash
cd front-end
npm install

```

**Tạo file `.env`**:
Tại thư mục gốc của `front-end`(ngang hàng với`package.json`), tạo file `.env`:

```env
# Đường dẫn API tới Back-end
VITE_API_DOMAIN=http://localhost:3005

# Client ID của Google (Phải trùng với bên Back-end)
VITE_GOOGLE_CLIENT_ID=lay_tu_google_cloud_console

```

Chạy Front-end:

```bash
npm run dev

```

---

## 📝 Một số lệnh quan trọng

| Chức năng      | Lệnh (Terminal)                         |
| -------------- | --------------------------------------- |
| Chạy Back-end  | `node src/app.js` (tại folder back-end) |
| Chạy Front-end | `npm run dev` (tại folder front-end)    |
| Cài thư viện   | `npm install`                           |

---

_© 2025 Nguyễn Duy Tín - DA22TTA - 110122182_
