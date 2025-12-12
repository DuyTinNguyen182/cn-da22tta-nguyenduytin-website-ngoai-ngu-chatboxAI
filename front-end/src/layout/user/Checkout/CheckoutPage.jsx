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
  ShopOutlined,
} from "@ant-design/icons";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";

const { Title, Text } = Typography;

function CheckoutPage() {
  const { registrationId } = useParams();
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");

  const [registration, setRegistration] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    fetchCheckoutData();
  }, [registrationId]);

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      const regRes = await apiClient.get(`/registration/${registrationId}`);
      const regData = regRes.data;

      if (regData.isPaid) {
        messageApi.warning("Đơn này đã thanh toán!");
        navigate(`/my-courses/${regData.user_id._id}`);
        return;
      }

      setRegistration(regData);
      const price =
        regData.course_id.discounted_price || regData.course_id.Tuition;
      setOriginalPrice(price);

      if (regData.coupon_id) {
        setDiscountAmount(regData.discount_amount);
        setFinalPrice(regData.final_amount);
      } else {
        setFinalPrice(price);
      }

      const couponRes = await apiClient.get("/coupon/available");
      setAvailableCoupons(couponRes.data);
    } catch (error) {
      console.error(error);
      messageApi.error("Không thể tải thông tin đơn hàng.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    if (!codeToApply) {
      messageApi.error("Vui lòng nhập mã giảm giá");
      return;
    }
    setProcessing(true);
    try {
      const res = await apiClient.post("/coupon/apply", {
        registrationId,
        couponCode: codeToApply,
      });
      setDiscountAmount(res.data.discountAmount);
      setFinalPrice(res.data.finalAmount);
      setAppliedCoupon(res.data.couponCode);
      messageApi.success("Áp dụng mã giảm giá thành công!");
    } catch (error) {
      messageApi.error(
        error.response?.data?.message || "Mã giảm giá không hợp lệ"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitOrder = async () => {
    setProcessing(true);
    try {
      if (paymentMethod === "vnpay") {
        const res = await apiClient.post("/payment/create_payment_url", {
          registrationId,
        });
        if (res.data.url) {
          window.location.href = res.data.url;
        } else {
          messageApi.error("Không nhận được link thanh toán.");
        }
      } else {
        await apiClient.post("/payment/complete_cash", {
          registrationId,
        });

        messageApi.success({
          content:
            "Giữ chỗ thành công! Vui lòng đến trung tâm để hoàn tất học phí.",
          duration: 2,
        });

        setTimeout(
          () => navigate(`/my-courses/${registration?.user_id?._id}`),
          1500
        );
      }
    } catch (error) {
      messageApi.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
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
      {/* [SỬA ĐỔI 2] Thêm contextHolder vào JSX để render thông báo */}
      {contextHolder}

      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
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

          <Col xs={24} lg={10}>
            <Card className="shadow-md rounded-xl border-t-4 border-blue-600">
              <Title level={3} className="text-center">
                Thanh toán
              </Title>
              <Divider />

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
                          onClick={() => setCouponCode(coupon.code)}
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

              <div className="mb-6">
                <Title level={5}>Chọn phương thức thanh toán</Title>
                <Radio.Group
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  value={paymentMethod}
                  className="w-full"
                >
                  <Space direction="vertical" className="w-full">
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "vnpay"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <Radio value="vnpay" className="w-full">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png"
                            alt="VNPay"
                            className="h-6 w-auto object-contain"
                          />
                          <span className="font-medium">
                            Ví VNPAY / Thẻ ATM
                          </span>
                        </div>
                      </Radio>
                    </div>

                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "cash"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <Radio value="cash" className="w-full">
                        <div className="flex items-center gap-3">
                          <ShopOutlined className="text-2xl text-green-600" />
                          <div>
                            <div className="font-medium text-green-700">
                              Thanh toán tại trung tâm
                            </div>
                            <div className="text-xs text-gray-500">
                              Đến trực tiếp trung tâm để đóng học phí
                            </div>
                          </div>
                        </div>
                      </Radio>
                    </div>
                  </Space>
                </Radio.Group>
              </div>

              <Divider />

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Giá gốc khóa học:</span>
                  <span>{course?.Tuition?.toLocaleString()} ₫</span>
                </div>
                {course?.discount_percent > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({course.discount_percent}%):</span>
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
                    <span>Mã giảm giá:</span>
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
                className={`mt-6 h-12 text-lg font-bold shadow-lg border-0 ${
                  paymentMethod === "vnpay"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500"
                    : "bg-green-600 hover:bg-green-500"
                }`}
                icon={
                  paymentMethod === "vnpay" ? (
                    <SafetyCertificateOutlined />
                  ) : (
                    <ShopOutlined />
                  )
                }
                onClick={handleSubmitOrder}
                loading={processing}
              >
                {paymentMethod === "vnpay"
                  ? "THANH TOÁN QUA VNPAY"
                  : "HOÀN TẤT ĐĂNG KÝ"}
              </Button>

              <div className="text-center mt-3 text-gray-400 text-xs">
                {paymentMethod === "vnpay"
                  ? "Hệ thống sẽ chuyển hướng bạn sang cổng VNPay."
                  : "Vui lòng hoàn tất học phí trong vòng 48h để đảm bảo chỗ học."}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default CheckoutPage;
