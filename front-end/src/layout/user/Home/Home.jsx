import { Link } from "react-router-dom";
import banner from "../../../imgs/banner.png";
import banner2 from "../../../imgs/banner2.png";
import banner3 from "../../../imgs/banner3.png";
import "./Home.css";
import { Spin, Carousel, message } from "antd";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

import apiClient from "../../../api/axiosConfig";

import CourseDetailModal from "../../../components/CourseDetailModal/CourseDetailModal";
import CourseCard from "../../../components/CourseCard/CourseCard";

function Home() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [spinning, setSpinning] = useState(false);

  const { state } = useAuth();
  const { currentUser } = state;
  const userId = currentUser?._id;

  const [messageApi, contextHolder] = message.useMessage();

  const successMessage = () => {
    messageApi.open({
      type: "success",
      content: "Đăng ký thành công!",
    });
  };

  const errorMessage = (msg = "Đăng ký thất bại. Vui lòng thử lại.") => {
    messageApi.open({
      type: "error",
      content: msg,
    });
  };
  
  const handleRegister = async (courseId) => {
    if (!userId) {
      errorMessage("Hãy đăng nhập để tiếp tục!");
      return;
    }
    try {
      const response = await apiClient.post(
        "/registration",
        { user_id: userId, course_id: courseId }
      );

      if (response.status === 201) {
        successMessage();
      } else {
        errorMessage();
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký khóa học:", error);
      errorMessage(error.response?.data?.message);
    }
  };

  const fetchData = async () => {
    setSpinning(true);
    try {
      const courseRes = await apiClient.get("/course");
      setFeaturedCourses(courseRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu khóa học:", error);
      messageApi.error("Không thể tải dữ liệu khóa học!");
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="homepage">
      {contextHolder}
      <Spin spinning={spinning} fullscreen />

      {/* Banner */}
      <Carousel autoplay autoplaySpeed={3000}>
        {[banner, banner2, banner3].map((img, i) => (
          <div className="homepage-banner" key={i}>
            <img src={img} alt={`Banner ${i + 1}`} />
          </div>
        ))}
      </Carousel>

      {/* Khóa học nổi bật */}
      <section className="homepage-section">
        <div className="section-header">
          <span>Khóa học nổi bật</span>
          <Link to="/courses">
            <span>Xem tất cả</span>
            <ion-icon name="arrow-forward"></ion-icon>
          </Link>
        </div>

        <div className="course-list">
          {featuredCourses.slice(0, 4).map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onDetailClick={setSelectedCourse}
              onRegisterClick={handleRegister}
            />
          ))}
        </div>

        {/* Modal chi tiết */}
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      </section>
    </div>
  );
}

export default Home;