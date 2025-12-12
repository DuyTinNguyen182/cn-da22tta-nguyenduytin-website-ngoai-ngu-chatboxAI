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
  Typography,
  Radio,
  Space,
  Modal,
  Empty,
  Avatar,
  Image,
  Progress,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ShopOutlined,
  TagsOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";
import courseImagePlaceholder from "../../../imgs/image.png";

const { Title } = Typography;

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
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

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
        setAppliedCoupon(regData.coupon_code);
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

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code) {
      messageApi.error("Vui lòng nhập hoặc chọn mã giảm giá");
      return;
    }
    setProcessing(true);
    try {
      const res = await apiClient.post("/coupon/apply", {
        registrationId,
        couponCode: code,
      });
      setDiscountAmount(res.data.discountAmount);
      setFinalPrice(res.data.finalAmount);
      setAppliedCoupon(res.data.couponCode);
      setCouponCode(res.data.couponCode);
      messageApi.success("Áp dụng mã giảm giá thành công!");
      setIsCouponModalOpen(false);
    } catch (error) {
      messageApi.error(
        error.response?.data?.message || "Mã giảm giá không hợp lệ"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setFinalPrice(originalPrice);
    setCouponCode("");
    messageApi.info("Đã gỡ bỏ mã giảm giá");
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

  const renderCouponItem = (coupon) => {
    const isSelected = appliedCoupon === coupon.code;

    const limit = Number(coupon.usage_limit);
    const count = Number(coupon.usage_count) || 0;
    const minOrder = Number(coupon.min_order_value) || 0;
    const maxDiscount = Number(coupon.max_discount_amount) || 0;

    const isExpired = new Date() > new Date(coupon.expiration_date);
    const hasLimit = !isNaN(limit) && limit > 0;
    const isOutOfStock = hasLimit && count >= limit;

    const isDisabled = isExpired || isOutOfStock;

    let usagePercent = 0;
    if (hasLimit) {
      usagePercent = Math.round((count / limit) * 100);
    }

    return (
      <div
        key={coupon._id}
        className={`relative flex flex-col sm:flex-row border rounded-lg p-4 mb-4 transition-all bg-white h-auto ${
          isDisabled
            ? "opacity-60 grayscale cursor-not-allowed bg-gray-50 border-gray-200"
            : isSelected
            ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/30 cursor-pointer shadow-sm"
            : "border-gray-200 hover:shadow-md cursor-pointer hover:border-blue-300"
        }`}
        onClick={() =>
          !isDisabled && !isSelected && handleApplyCoupon(coupon.code)
        }
      >
        <div className="flex flex-col items-center justify-center min-w-[110px] border-b sm:border-b-0 sm:border-r border-dashed border-gray-300 pr-0 sm:pr-4 mb-3 sm:mb-0 text-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              isDisabled ? "bg-gray-200" : "bg-blue-100"
            }`}
          >
            <GiftOutlined
              className={`text-xl ${
                isDisabled ? "text-gray-400" : "text-blue-600"
              }`}
            />
          </div>

          <div
            className={`text-xl font-bold leading-tight ${
              isDisabled ? "text-gray-500" : "text-red-600"
            }`}
          >
            {coupon.discount_type === "percent"
              ? `${coupon.discount_value}%`
              : `${coupon.discount_value / 1000}k`}
          </div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
            GIẢM GIÁ
          </div>
        </div>

        <div className="flex-1 pl-0 sm:pl-4 flex flex-col gap-1.5 justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-gray-800 text-lg m-0">
              {coupon.code}
            </h4>
            {isExpired && <Tag color="error">Hết hạn</Tag>}
            {isOutOfStock && !isExpired && <Tag color="warning">Hết lượt</Tag>}
          </div>

          <p className="text-gray-600 text-sm m-0 leading-relaxed">
            {coupon.description || "Mã giảm giá khuyến mãi."}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 my-1">
            {minOrder > 0 && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <InfoCircleOutlined className="text-blue-400" />
                Đơn tối thiểu:{" "}
                <span className="font-medium text-gray-700">
                  {minOrder.toLocaleString()}đ
                </span>
              </div>
            )}
            {coupon.discount_type === "percent" && maxDiscount > 0 && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <InfoCircleOutlined className="text-orange-400" />
                Giảm tối đa:{" "}
                <span className="font-medium text-gray-700">
                  {maxDiscount.toLocaleString()}đ
                </span>
              </div>
            )}
          </div>

          <Divider dashed style={{ margin: "8px 0" }} />

          <div className="flex flex-col gap-2">
            {hasLimit ? (
              <div className="w-full">
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>Đã dùng: {usagePercent}%</span>
                  <span className="font-medium text-gray-700">
                    {count} / {limit} lượt
                  </span>
                </div>
                <Progress
                  percent={usagePercent}
                  showInfo={false}
                  size="small"
                  strokeColor={isOutOfStock ? "#ff4d4f" : "#1890ff"}
                  trailColor="#f0f0f0"
                />
              </div>
            ) : (
              <div className="text-xs text-green-600 flex items-center gap-1 font-medium bg-green-50 w-fit px-2 py-0.5 rounded">
                <CheckCircleOutlined /> Không giới hạn lượt dùng
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-gray-400">
              <ClockCircleOutlined />
              <span>
                HSD: {moment(coupon.expiration_date).format("DD/MM/YYYY")}
              </span>
            </div>
          </div>
        </div>

        {!isDisabled && (
          <div className="flex items-center justify-center sm:pl-3 mt-3 sm:mt-0 min-w-[90px] border-l-0 sm:border-l border-gray-100 border-dashed">
            {isSelected ? (
              <div className="flex flex-col items-center text-blue-600">
                <CheckCircleOutlined className="text-2xl mb-1" />
                <span className="text-xs font-bold">Đã chọn</span>
              </div>
            ) : (
              <Button
                type="primary"
                size="small"
                className="bg-blue-600 shadow-sm font-medium w-full"
              >
                Áp dụng
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <Spin fullscreen tip="Đang tải..." />;

  const course = registration?.course_id;
  const session = registration?.class_session_id;
  const user = registration?.user_id;

  return (
    <div className="bg-[#f5f5fa] min-h-screen py-8 px-4">
      {contextHolder}

      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          className="mb-4 border-none shadow-sm"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={15}>
            <Card
              className="shadow-sm rounded-xl border-0 overflow-hidden"
              bodyStyle={{ padding: 0 }}
            >
              <div className="bg-[#1890ff] p-4 text-white flex items-center gap-2">
                <BookOutlined />
                <span className="font-bold text-lg">Thông tin đăng ký</span>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-6 mb-6">
                  <Image
                    width={160}
                    height={100}
                    src={course?.image || courseImagePlaceholder}
                    fallback="https://via.placeholder.com/160x100?text=No+Image"
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {course?.language_id?.language} -{" "}
                      {course?.languagelevel_id?.language_level}
                    </h2>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                        <span>Mã khóa học:</span>
                        <span className="font-medium text-black">
                          {course?.courseid}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                        <span>Giảng viên:</span>
                        <span className="font-medium text-blue-600">
                          {course?.teacher_id?.full_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thời lượng:</span>
                        <span>{course?.Number_of_periods} tiết</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Divider />
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <CalendarOutlined className="text-blue-500" /> Lịch học
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                      <div className="text-xl font-bold text-blue-800 mb-1">
                        {session?.days}
                      </div>
                      <div className="text-gray-600 font-medium">
                        {session?.time}
                      </div>
                    </div>
                    <div className="mt-2 text-center text-xs text-gray-500">
                      Ngày khai giảng:{" "}
                      {moment(course?.Start_Date).format("DD/MM/YYYY")}
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="h-full border-l pl-0 md:pl-6 border-dashed border-gray-300">
                      <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <UserOutlined className="text-green-500" /> Thông tin
                        học viên
                      </h4>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar
                          size="large"
                          style={{ backgroundColor: "#87d068" }}
                          icon={<UserOutlined />}
                        />
                        <div>
                          <div className="font-bold">{user?.fullname}</div>
                          <div className="text-xs text-gray-500">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        Mã học viên: <strong>{user?.userid}</strong>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            <div className="sticky top-6">
              <Card className="shadow-lg rounded-xl border-0">
                <Title level={4}>Tổng quan thanh toán</Title>
                <Divider style={{ margin: "12px 0" }} />

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 flex items-center gap-1">
                      <TagsOutlined /> Mã ưu đãi
                    </span>
                    <span
                      className="text-blue-600 cursor-pointer text-sm hover:underline"
                      onClick={() => setIsCouponModalOpen(true)}
                    >
                      Chọn mã giảm giá
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập mã code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      disabled={!!appliedCoupon}
                    />
                    <Button
                      onClick={() => handleApplyCoupon()}
                      disabled={!!appliedCoupon || !couponCode}
                      loading={processing && !isCouponModalOpen}
                    >
                      Áp dụng
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="mt-2 text-green-600 text-sm flex justify-between">
                      <span>
                        <CheckCircleOutlined /> Đã dùng:{" "}
                        <strong>{appliedCoupon}</strong>
                      </span>
                      <span
                        className="text-red-500 cursor-pointer"
                        onClick={handleRemoveCoupon}
                      >
                        Gỡ
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4 text-gray-600">
                  <div className="flex justify-between">
                    <span>Giá gốc:</span>
                    <span>{course?.Tuition?.toLocaleString()} đ</span>
                  </div>
                  {course?.discount_percent > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({course.discount_percent}%):</span>
                      <span>
                        -
                        {(
                          course.Tuition - course.discounted_price
                        ).toLocaleString()}{" "}
                        đ
                      </span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Voucher:</span>
                      <span>-{discountAmount.toLocaleString()} đ</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-700">
                    Tổng thanh toán:
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {finalPrice?.toLocaleString()} đ
                  </span>
                </div>

                <div className="mb-4">
                  <div className="font-medium mb-2">
                    Chọn phương thức thanh toán:
                  </div>
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
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <Radio value="vnpay" className="w-full">
                          <div className="flex justify-between items-center w-full">
                            <span className="font-medium ml-2">
                              Ví VNPAY / Thẻ ATM
                            </span>
                            <img
                              src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png"
                              alt="VNPay"
                              className="h-5"
                            />
                          </div>
                        </Radio>
                      </div>
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          paymentMethod === "cash"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <Radio value="cash" className="w-full">
                          <div className="flex items-center w-full">
                            <span className="font-medium ml-2">
                              Thanh toán tại trung tâm
                            </span>
                            <ShopOutlined className="ml-auto text-lg text-gray-500" />
                          </div>
                        </Radio>
                      </div>
                    </Space>
                  </Radio.Group>
                </div>

                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleSubmitOrder}
                  loading={processing}
                  style={{
                    height: 48,
                    fontSize: 16,
                    fontWeight: "bold",
                    backgroundColor: "#103fa6",
                  }}
                >
                  <SafetyCertificateOutlined /> THANH TOÁN NGAY
                </Button>
                <div className="text-center mt-3 text-xs text-gray-400">
                  Bằng việc thanh toán, bạn đồng ý với điều khoản sử dụng của
                  chúng tôi.
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 border-b pb-3 text-lg">
            <GiftOutlined className="text-red-500" /> Danh sách mã ưu đãi
          </div>
        }
        open={isCouponModalOpen}
        onCancel={() => setIsCouponModalOpen(false)}
        footer={null}
        centered
        width={550}
        bodyStyle={{
          maxHeight: "60vh",
          overflowY: "auto",
          background: "#f9f9f9",
          padding: "16px",
        }}
      >
        <div className="mb-3 text-gray-500 text-sm">
          <InfoCircleOutlined /> Nhập mã thủ công hoặc chọn từ danh sách bên
          dưới
        </div>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Tìm hoặc nhập mã..."
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          />
          <Button type="primary" onClick={() => handleApplyCoupon()}>
            Áp dụng
          </Button>
        </div>

        {availableCoupons.length > 0 ? (
          availableCoupons
            .filter((c) => c.isActive)
            .map((c) => renderCouponItem(c))
        ) : (
          <Empty description="Hiện chưa có mã giảm giá nào" />
        )}
      </Modal>
    </div>
  );
}

export default CheckoutPage;
