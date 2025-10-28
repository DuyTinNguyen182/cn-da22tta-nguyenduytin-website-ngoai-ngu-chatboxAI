import { useEffect, useState } from "react";
import { Spin, message } from "antd";
import "./RegisteredCourses.css";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import RegisteredCourseCard from "../../../components/RegisteredCourseCard/RegisteredCourseCard";

function RegisteredCourses() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);

  const { state } = useAuth();
  const { currentUser } = state;
  const userId = currentUser?._id;

  const [messageApi, contextHolder] = message.useMessage();

  const fetchCourses = async (uid) => {
    if (!uid) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/registration/user/${uid}`);
      setRegistrations(res.data);
    } catch (err) {
      messageApi.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (registrationId) => {
    try {
      await apiClient.delete(`/registration/${registrationId}`);
      messageApi.open({ type: "success", content: "Hủy đăng ký thành công" });
      fetchCourses(userId); // Tải lại danh sách
    } catch (err) {
      messageApi.open({ type: "error", content: "Hủy thất bại" });
    }
  };

  const handlePayment = async (registrationId, tuition) => {
    setSpinning(true);
    try {
      const res = await apiClient.post(`/payment/create_payment_url`, {
        registrationId: registrationId,
      });
      const paymentUrl = res.data.url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        messageApi.error("Không thể tạo yêu cầu thanh toán.");
      }
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSpinning(false);
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchCourses(userId);
    } else {
      setLoading(false); // Nếu không có userId, dừng loading
    }
  }, [userId]);

  // if (loading) return <Spin fullscreen />;

  return (
    <div className="registered-courses-page">
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <div className="registered-courses-grid">
        {registrations.length > 0 ? (
          registrations.map((registration) => (
            <RegisteredCourseCard
              key={registration._id}
              registration={registration}
              onUnregister={handleUnregister}
              onPayment={handlePayment}
            />
          ))
        ) : (
          <p>Bạn chưa đăng ký khóa học nào.</p>
        )}
      </div>
    </div>
  );
}

export default RegisteredCourses;