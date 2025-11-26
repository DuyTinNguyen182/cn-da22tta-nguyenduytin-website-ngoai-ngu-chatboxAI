import { useEffect, useState } from "react";
import { Spin, message, Button } from "antd";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import RegisteredCourseCard from "../../../components/RegisteredCourseCard/RegisteredCourseCard";
import { BookOutlined, AppstoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function RegisteredCourses() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);

  const navigate = useNavigate();
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
      fetchCourses(userId);
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
      messageApi.error(
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
      );
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCourses(userId);
    } else {
      setLoading(false);
    }
  }, [userId]);

  return (
    <div className="w-full min-h-screen bg-[#F2F4F7] py-6 pb-20">
      {contextHolder}
      <Spin spinning={spinning} fullscreen />

      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <BookOutlined className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Khóa học của tôi
            </h1>
            <p className="text-gray-500 text-sm">
              Đã đăng ký{" "}
              <strong className="text-600">{registrations.length}</strong> khóa
              học
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : registrations.length > 0 ? (
          <div className="flex flex-col gap-5">
            {registrations.map((registration) => (
              <RegisteredCourseCard
                key={registration._id}
                registration={registration}
                onUnregister={handleUnregister}
                onPayment={handlePayment}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-16 border border-dashed border-gray-300 shadow-sm text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <AppstoreOutlined className="text-5xl text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Chưa có khóa học nào
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Danh sách đăng ký đang trống. Hãy tìm kiếm khóa học phù hợp để
              nâng cao trình độ ngay hôm nay!
            </p>
            <Button
              type="primary"
              size="large"
              className="bg-blue-600 font-semibold px-10 h-12 rounded-xl shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
              onClick={() => navigate("/courses")}
            >
              Tìm khóa học
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisteredCourses;
