import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  YoutubeOutlined,
  FacebookFilled,
  GlobalOutlined,
  UserOutlined,
  SendOutlined,
  MessageOutlined,
  InstagramOutlined,
} from "@ant-design/icons";
import zaloIcon from "../../../imgs/icon_zalo.webp";
import apiClient from "../../../api/axiosConfig";

const { TextArea } = Input;

function ContactPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await apiClient.post("/contacts", values);

      messageApi.success("Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ sớm.");
      form.resetFields();
    } catch (error) {
      console.error(error);
      messageApi.error("Gửi thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] pb-20">
      {contextHolder}

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16 md:py-20 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Liên hệ với DREAM
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Chúng tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn trên hành
          trình chinh phục ngoại ngữ
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ContactCard
            icon={<EnvironmentOutlined />}
            title="Địa chỉ"
            content="Số 123, Phường Hòa Thuận, Tỉnh Vĩnh Long"
            link="#"
            color="text-red-500"
          />
          <ContactCard
            icon={<PhoneOutlined />}
            title="Hotline"
            content="0794 325 729"
            subContent="(Giải đáp thắc mắc)"
            link="tel:0794325729"
            color="text-green-500"
          />
          <ContactCard
            icon={<MailOutlined />}
            title="Email"
            content="dream@gmail.com"
            link="mailto:dream@gmail.com"
            color="text-blue-500"
          />
          <ContactCard
            icon={<ClockCircleOutlined />}
            title="Giờ làm việc"
            content="Thứ 2 - Chủ Nhật"
            subContent="7:00 – 21:00"
            color="text-orange-500"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <MessageOutlined className="text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Gửi tin nhắn cho chúng tôi
                </h2>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="fullname"
                    label={
                      <span className="font-semibold text-gray-700">
                        Họ và tên
                      </span>
                    }
                    rules={[
                      { required: true, message: "Vui lòng nhập họ tên!" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Nhập họ tên của bạn"
                    />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label={
                      <span className="font-semibold text-gray-700">
                        Số điện thoại
                      </span>
                    }
                    rules={[
                      // {
                      //   required: true,
                      //   message: "Vui lòng nhập số điện thoại!",
                      // },
                      {
                        pattern: /^[0-9]{10,11}$/,
                        message: "Số điện thoại không hợp lệ!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  name="email"
                  label={
                    <span className="font-semibold text-gray-700">Email</span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không đúng định dạng!" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="Nhập địa chỉ email"
                  />
                </Form.Item>

                <Form.Item
                  name="content"
                  label={
                    <span className="font-semibold text-gray-700">
                      Nội dung tin nhắn
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập nội dung cần tư vấn!",
                    },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Bạn cần tư vấn về khóa học nào hoặc có thắc mắc gì?"
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SendOutlined />}
                    className="w-full h-12 bg-blue-600 hover:!bg-blue-500 font-bold text-lg rounded-xl shadow-md shadow-blue-200"
                  >
                    Gửi tin nhắn ngay
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <GlobalOutlined className="text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Về Trung tâm Ngoại ngữ DREAM
                </h2>
              </div>

              <div className="text-gray-600 leading-relaxed text-justify space-y-4">
                <p>
                  Thành lập từ năm 2025, Trung tâm Ngoại ngữ DREAM hướng đến mục
                  tiêu trở thành đơn vị đào tạo ngoại ngữ đáng tin cậy nhất tại
                  Vĩnh Long. Chúng tôi chú trọng xây dựng môi trường học tập
                  thân thiện, hiệu quả, giúp học viên tự tin sử dụng ngoại ngữ
                  trong học tập, công việc và cuộc sống.
                </p>
                <p>
                  Với đội ngũ giảng viên nhiều năm kinh nghiệm, chương trình học
                  chuẩn quốc tế, kết hợp phương pháp giảng dạy sinh động, học
                  viên không chỉ được trang bị kiến thức mà còn rèn luyện tư
                  duy, kỹ năng giao tiếp thực tế.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="text-blue-600 text-2xl">★</span> Giá trị cốt
                lõi
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Chất lượng đào tạo cao",
                  "Lộ trình học rõ ràng",
                  "Giảng viên giàu chuyên môn",
                  "Môi trường học tích cực",
                  "Hỗ trợ học viên tận tâm",
                  "Truyền cảm hứng học tập",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm"
                  >
                    <CheckCircleOutlined className="text-green-500 shrink-0" />
                    <span className="font-medium text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:w-[400px] space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-red-500 pl-3">
                Video giới thiệu
              </h3>
              <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/NoLTvyXiePg"
                  title="Giới thiệu DREAM"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-l-4 border-blue-500 pl-3">
                Kết nối với chúng tôi
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <SocialButton
                  icon={<FacebookFilled />}
                  label="Facebook"
                  color="bg-[#1877F2]"
                  link="#"
                />
                <SocialButton
                  icon={<YoutubeOutlined />}
                  label="YouTube"
                  color="bg-[#FF0000]"
                  link="#"
                />
                <SocialButton
                  icon={<InstagramOutlined />}
                  label="Instagram"
                  color="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                  link="#"
                />
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-12 rounded-lg text-white font-medium bg-[#0068FF] hover:opacity-90 transition shadow-md hover:-translate-y-1"
                >
                  <img
                    src={zaloIcon}
                    alt="Zalo"
                    className="w-6 h-6 object-contain"
                  />
                  <span>Zalo</span>
                </a>
              </div>
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 h-64 relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition">
                <div className="text-center text-gray-500">
                  <EnvironmentOutlined className="text-4xl mb-2" />
                  <p>Xem bản đồ chi tiết</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ContactCard = ({ icon, title, content, subContent, link, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 text-center hover:-translate-y-2 transition-transform duration-300">
    <div
      className={`w-14 h-14 mx-auto rounded-full bg-gray-50 flex items-center justify-center text-3xl mb-4 ${color}`}
    >
      {icon}
    </div>
    <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
    {link ? (
      <a
        href={link}
        className="text-blue-600 font-medium hover:underline block break-words"
      >
        {content}
      </a>
    ) : (
      <p className="text-gray-600 font-medium break-words">{content}</p>
    )}
    {subContent && <p className="text-gray-400 text-sm mt-1">{subContent}</p>}
  </div>
);

const SocialButton = ({ icon, label, color, link }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center justify-center gap-2 h-12 rounded-lg text-white font-medium shadow-md hover:opacity-90 hover:-translate-y-1 transition ${color}`}
  >
    <span className="text-xl flex">{icon}</span>
    <span>{label}</span>
  </a>
);

export default ContactPage;
