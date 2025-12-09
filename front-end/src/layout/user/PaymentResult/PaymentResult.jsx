import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function PaymentResult() {
  const location = useLocation();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...");

  const { state } = useAuth();
  const { currentUser } = state;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const responseCode = params.get("vnp_ResponseCode");
    const transactionStatus = params.get("vnp_TransactionStatus");

    if (responseCode === "00" && transactionStatus === "00") {
      setStatus("success");
      setMessage(
        "Cảm ơn bạn đã thanh toán khóa học của chúng tôi! Hóa đơn đã được gửi về Email của bạn. Chúc bạn học tập thật tốt."
      );
    } else {
      setStatus("error");
      setMessage(
        "Giao dịch thất bại hoặc đã bị hủy. Vui lòng thử lại hoặc liên hệ Admin."
      );
    }
  }, [location]);

  if (status === "processing") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-lg font-medium">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-400 border-t-transparent mr-4"></div>
        Đang kết nối với cổng thanh toán...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white w-full max-w-xl shadow-lg rounded-xl p-6">
        <div className="text-center">
          {status === "success" ? (
            <svg
              className="w-20 h-20 mx-auto text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12l2 2l4 -4"
              />
            </svg>
          ) : (
            <svg
              className="w-20 h-20 mx-auto text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502 -1.667 1.732 -3l-6.928 -12c-.77 -1.333 -2.694 -1.333 -3.464 0l-6.928 12c-.77 1.333 .192 3 1.732 3z"
              />
            </svg>
          )}

          <h1 className="text-2xl font-semibold mt-4">
            {status === "success"
              ? "Thanh toán thành công!"
              : "Thanh toán thất bại"}
          </h1>

          <p className="text-gray-600 mt-2">{message}</p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              to={currentUser ? `/my-courses/${currentUser._id}` : "/"}
              className="w-full"
            >
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                {status === "success"
                  ? "Vào khóa học của tôi"
                  : "Quay về trang chủ"}
              </button>
            </Link>

            <Link to="/courses" className="w-full">
              <button className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                Xem khóa học khác
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
