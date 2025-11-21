import React from "react";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
//   TeamOutlined,
  CheckCircleOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import "./ContactPage.css";
import zaloIcon from "../../../imgs/icon_zalo.webp";

function ContactPage() {
  return (
    <div className="contact-page-container">
      <div className="contact-header-section">
        <h1>Liên hệ với Trung tâm Ngoại ngữ DREAM</h1>
        <p>
          Chúng tôi luôn đồng hành cùng bạn trong hành trình chinh phục ngoại
          ngữ.
        </p>
      </div>

      <div className="contact-single-column">
        <p className="title">Về Trung tâm Ngoại ngữ DREAM</p>
        <p className="about-us-text">
          Thành lập từ năm 2025, Trung tâm Ngoại ngữ DREAM hướng đến mục tiêu
          trở thành đơn vị đào tạo ngoại ngữ đáng tin cậy nhất tại Vĩnh Long.
          Chúng tôi chú trọng xây dựng môi trường học tập thân thiện, hiệu quả,
          giúp học viên tự tin sử dụng ngoại ngữ trong học tập, công việc và
          cuộc sống.
          <br />
          <br />
          Với đội ngũ giảng viên nhiều năm kinh nghiệm, chương trình học chuẩn
          quốc tế, kết hợp phương pháp giảng dạy sinh động, học viên không chỉ
          được trang bị kiến thức mà còn rèn luyện tư duy, kỹ năng giao tiếp
          thực tế. DREAM tin rằng ngoại ngữ không chỉ là một khóa học mà là công
          cụ quan trọng giúp bạn vươn xa hơn trong học tập, sự nghiệp và cuộc
          sống.
          <br />
          <br />
          Không chỉ đào tạo, DREAM còn đồng hành cùng học viên trong suốt quá
          trình học – từ kiểm tra trình độ, xây dựng lộ trình cá nhân hóa, hỗ
          trợ ngoài giờ đến các hoạt động ngoại khóa như câu lạc bộ tiếng Anh,
          workshop kỹ năng và các kỳ thi thử chứng chỉ. Chúng tôi tạo ra một môi
          trường nơi mọi học viên đều cảm thấy tự tin, hỗ trợ và tôn trọng.
        </p>

        <div className="highlight-box">
          <h3>Giá trị cốt lõi</h3>
          <ul>
            <li>
              <CheckCircleOutlined /> Chất lượng đào tạo cao – lộ trình rõ ràng
            </li>
            <li>
              <CheckCircleOutlined /> Giảng viên giàu chuyên môn – thân thiện -
              phương pháp giảng dạy mới mẻ
            </li>
            <li>
              <CheckCircleOutlined /> Môi trường tích cực – truyền cảm hứng
            </li>
            <li>
              <CheckCircleOutlined /> Hỗ trợ học viên tận tâm
            </li>
          </ul>
        </div>

        <h2 className="connect">Thông tin liên hệ</h2>

        <div className="info-item">
          <EnvironmentOutlined className="info-icon" />
          <div>
            <strong>Địa chỉ:</strong>
            <p>
              <a href="#" target="_blank" rel="noopener noreferrer">
                Số 123, Phường Hòa Thuận, Tỉnh Vĩnh Long
              </a>
            </p>
          </div>
        </div>

        <div className="info-item">
          <PhoneOutlined className="info-icon" />
          <div>
            <strong>Hotline:</strong>
            <p>
              <a href="tel:0794325729">0794 325 729</a> (Giải đáp thắc mắc)
            </p>
          </div>
        </div>

        <div className="info-item">
          <MailOutlined className="info-icon" />
          <div>
            <strong>Email:</strong>
            <p>
              <a href="#">dream@gmail.com</a>
            </p>
          </div>
        </div>

        <div className="info-item">
          <ClockCircleOutlined className="info-icon" />
          <div>
            <strong>Giờ làm việc:</strong>
            <p>Thứ 2 - Chủ Nhật: 7:00 – 21:00</p>
          </div>
        </div>

        {/* <div className="info-item">
          <TeamOutlined className="info-icon" />
          <div>
            <strong>Hỗ trợ học viên:</strong>
            <p>Đội ngũ tư vấn hỗ trợ 24/7 qua hotline & fanpage.</p>
          </div>
        </div> */}

        <h2 className="connect">Video giới thiệu</h2>
        <div className="youtube-video-box">
          <iframe
            src="https://www.youtube.com/embed/"
            title="Giới thiệu DREAM"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <h2 className="connect">Kết nối với chúng tôi</h2>
        <div className="social-media-links">
          <a
            href="#"
            className="social-icon facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ion-icon name="logo-facebook"></ion-icon>
          </a>

          <a
            href="#"
            className="social-icon youtube"
            target="_blank"
            rel="noopener noreferrer"
          >
            <YoutubeOutlined />
          </a>

          <a
            href="#"
            className="social-icon tiktok"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ion-icon name="logo-tiktok"></ion-icon>
          </a>

          <a
            href="#"
            className="social-icon zalo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={zaloIcon} alt="Zalo" className="zalo-img" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
