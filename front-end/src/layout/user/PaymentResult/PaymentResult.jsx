import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Spin, Result, Button, Card } from "antd";
import { useAuth } from "../../../context/AuthContext";

function PaymentResult() {
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
      setMessage("Giao dịch thành công! Bạn chúc bạn học tập thật tốt.");
    } else {
      setStatus("error");
      setMessage(
        "Giao dịch thất bại hoặc đã bị hủy. Vui lòng thử lại hoặc liên hệ Admin."
      );
    }
  }, [location]);

  if (status === "processing") {
    return <Spin fullscreen tip="Đang kết nối với cổng thanh toán..." />;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card style={{ width: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Result
          status={status}
          title={
            status === "success"
              ? "Thanh toán thành công!"
              : "Thanh toán thất bại"
          }
          subTitle={message}
          extra={[
            <Link
              to={currentUser ? `/my-courses/${currentUser._id}` : "/"}
              key="my-courses"
            >
              <Button type="primary" size="large">
                {status === "success"
                  ? "Vào khóa học của tôi"
                  : "Quay về trang chủ"}
              </Button>
            </Link>,
            <Link to="/courses" key="buy-more">
              <Button size="large">Xem khóa học khác</Button>
            </Link>,
          ]}
        />
      </Card>
    </div>
  );
}

export default PaymentResult;
