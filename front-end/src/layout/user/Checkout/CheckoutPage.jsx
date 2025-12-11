import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Divider,
  Input,
  message,
  Spin,
  Row,
  Col,
  Statistic,
  Tag,
  List,
  Typography,
  Radio,
  Space,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  PercentageOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import apiClient from "../../../api/axiosConfig"; // Đường dẫn tuỳ cấu trúc của bạn
import moment from "moment";

const { Title, Text } = Typography;

function CheckoutPage() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Dữ liệu đơn hàng
  const [registration, setRegistration] = useState(null);

  // Dữ liệu mã giảm giá
  const [couponCode, setCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // Lưu thông tin mã đã áp dụng

  // Giá trị tiền
  const [originalPrice, setOriginalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    fetchCheckoutData();
  }, [registrationId]);

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      // 1. Lấy thông tin đơn đăng ký
      const regRes = await apiClient.get(`/registration/${registrationId}`);
      const regData = regRes.data;

      if (regData.isPaid) {
        message.warning("Đơn này đã thanh toán!");
        navigate(`/my-courses/${regData.user_id._id}`);
        return;
      }

      setRegistration(regData);

      // Tính toán giá khởi điểm (ưu tiên giá khuyến mãi của khóa học)
      const price =
        regData.course_id.discounted_price || regData.course_id.Tuition;
      setOriginalPrice(price);

      // Nếu đơn hàng đã có áp dụng mã trước đó (trong DB)
      if (regData.coupon_id) {
        setDiscountAmount(regData.discount_amount);
        setFinalPrice(regData.final_amount);
        // Có thể fetch thêm info coupon nếu cần hiển thị code
      } else {
        setFinalPrice(price);
      }

      // 2. Lấy danh sách mã giảm giá khả dụng cho User chọn
      const couponRes = await apiClient.get("/coupon/available");
      setAvailableCoupons(couponRes.data);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải thông tin đơn hàng.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    if (!codeToApply) {
      message.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setProcessing(true);
    try {
      const res = await apiClient.post("/coupon/apply", {
        registrationId,
        couponCode: codeToApply,
      });

      // Cập nhật state từ phản hồi Backend
      setDiscountAmount(res.data.discountAmount);
      setFinalPrice(res.data.finalAmount);
      setAppliedCoupon(res.data.couponCode); // Lưu mã để hiển thị

      message.success("Áp dụng mã giảm giá thành công!");
    } catch (error) {
      message.error(
        error.response?.data?.message || "Mã giảm giá không hợp lệ"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Gọi API tạo URL thanh toán
      const res = await apiClient.post("/payment/create_payment_url", {
        registrationId,
      });

      // Chuyển hướng sang VNPay
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        message.error("Không nhận được link thanh toán.");
      }
    } catch (error) {
      message.error(
        "Lỗi khi tạo cổng thanh toán: " +
          (error.response?.data?.message || "Lỗi server")
      );
      setProcessing(false);
    }
  };

  if (loading)
    return <Spin fullscreen tip="Đang tải thông tin thanh toán..." />;

  const course = registration?.course_id;
  const session = registration?.class_session_id;
  const user = registration?.user_id;

  return (
    <div className="bg-[#f0f2f5] min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
        <Row gutter={[24, 24]}>
          {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
          <Col xs={24} lg={14}>
            {/* Thông tin khóa học */}
            <Card
              title={
                <>
                  <BookOutlined /> Thông tin khóa học
                </>
              }
              className="mb-4 shadow-sm rounded-xl"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <img
                  src={course?.image}
                  alt="course"
                  className="w-full md:w-32 h-24 object-cover rounded-lg border"
                />
                <div>
                  <Title level={4} style={{ margin: 0, color: "#1677ff" }}>
                    {course?.language_id?.language} -{" "}
                    {course?.languagelevel_id?.language_level}
                  </Title>
                  <Text type="secondary">Mã khóa học: {course?.courseid}</Text>
                  <div className="mt-2 text-gray-600">
                    <div>
                      Giảng viên:{" "}
                      <strong>{course?.teacher_id?.full_name}</strong>
                    </div>
                    <div>Thời lượng: {course?.Number_of_periods} tiết</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Thông tin lịch học */}
            <Card
              title={
                <>
                  <CalendarOutlined /> Lịch học đã chọn
                </>
              }
              className="mb-4 shadow-sm rounded-xl"
            >
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div>
                  <div className="font-bold text-lg text-blue-800">
                    {session?.days}
                  </div>
                  <div className="text-gray-600">{session?.time}</div>
                </div>
                <Tag color="blue">Đã giữ chỗ</Tag>
              </div>
            </Card>

            {/* Thông tin học viên */}
            <Card
              title={
                <>
                  <UserOutlined /> Thông tin học viên
                </>
              }
              className="shadow-sm rounded-xl"
            >
              <List>
                <List.Item>
                  <List.Item.Meta
                    title="Họ và tên"
                    description={user?.fullname}
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta title="Email" description={user?.email} />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    title="Mã học viên"
                    description={user?.userid}
                  />
                </List.Item>
              </List>
            </Card>
          </Col>

          {/* CỘT PHẢI: THANH TOÁN & COUPON */}
          <Col xs={24} lg={10}>
            <Card className="shadow-md rounded-xl border-t-4 border-blue-600">
              <Title level={3} className="text-center">
                Thanh toán
              </Title>
              <Divider />

              {/* Phần nhập Coupon */}
              <div className="mb-6">
                <Text strong>
                  <PercentageOutlined /> Mã giảm giá
                </Text>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Nhập mã giảm giá"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    disabled={appliedCoupon}
                  />
                  <Button
                    type="primary"
                    ghost
                    onClick={() => handleApplyCoupon()}
                    loading={processing}
                    disabled={appliedCoupon || !couponCode}
                  >
                    Áp dụng
                  </Button>
                </div>

                {/* Danh sách coupon gợi ý */}
                {availableCoupons.length > 0 && !appliedCoupon && (
                  <div className="mt-3">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Mã dành cho bạn:
                    </Text>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {availableCoupons.map((coupon) => (
                        <Tag
                          key={coupon._id}
                          color="cyan"
                          className="cursor-pointer hover:scale-105 transition-all"
                          onClick={() => {
                            setCouponCode(coupon.code);
                            // Tự động áp dụng luôn nếu muốn UX nhanh hơn
                            // handleApplyCoupon(coupon.code);
                          }}
                        >
                          {coupon.code} (-
                          {coupon.discount_type === "percent"
                            ? `${coupon.discount_value}%`
                            : `${coupon.discount_value.toLocaleString()}đ`}
                          )
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700 flex justify-between items-center">
                    <span>
                      <CheckCircleOutlined /> Đã dùng mã:{" "}
                      <strong>{appliedCoupon}</strong>
                    </span>
                    <Button
                      type="text"
                      size="small"
                      danger
                      onClick={() => {
                        setAppliedCoupon(null);
                        setDiscountAmount(0);
                        setFinalPrice(originalPrice);
                        setCouponCode("");
                      }}
                    >
                      Gỡ bỏ
                    </Button>
                  </div>
                )}
              </div>

              <Divider />

              {/* Chi tiết thanh toán */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Giá gốc khóa học:</span>
                  <span>{course?.Tuition?.toLocaleString()} ₫</span>
                </div>
                {course?.discount_percent > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá khóa học ({course.discount_percent}%):</span>
                    <span>
                      -
                      {(
                        course.Tuition - course.discounted_price
                      ).toLocaleString()}{" "}
                      ₫
                    </span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-blue-600 font-medium">
                    <span>Mã giảm giá ({appliedCoupon}):</span>
                    <span>-{discountAmount.toLocaleString()} ₫</span>
                  </div>
                )}

                <Divider style={{ margin: "12px 0" }} />

                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg">Tổng thanh toán:</span>
                  <span className="text-2xl font-bold text-red-600">
                    {finalPrice?.toLocaleString()} ₫
                  </span>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                className="mt-8 h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-0 shadow-lg"
                icon={<SafetyCertificateOutlined />}
                onClick={handlePayment}
                loading={processing}
              >
                THANH TOÁN QUA VNPAY
              </Button>

              <div className="text-center mt-3 text-gray-400 text-xs">
                Bảo mật thanh toán chuẩn quốc tế.
                <br />
                Hệ thống sẽ chuyển hướng bạn sang cổng VNPay.
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default CheckoutPage;
