import { Link, useNavigate } from "react-router-dom";
import banner from "../../../imgs/banner.png";
import banner2 from "../../../imgs/banner2.png";
import banner3 from "../../../imgs/banner3.png";
import "./Home.css";
import { Spin, Carousel, message, Flex } from "antd";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import CourseCard from "../../../components/CourseCard/CourseCard";

function Home() {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [spinning, setSpinning] = useState(true);
  const [activeSection, setActiveSection] = useState("featured");

  // Khởi tạo refs để theo dõi các section
  const sectionRefs = {
    featured: useRef(null),
    upcoming: useRef(null),
    ongoing: useRef(null),
    finished: useRef(null),
  };

  const { state } = useAuth();
  const { currentUser } = state;
  const userId = currentUser?._id;
  const [messageApi, contextHolder] = message.useMessage();

  // useEffect để tải dữ liệu khóa học
  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await apiClient.get("/course");
        setAllCourses(courseRes.data);
      } catch (error) {
        messageApi.error("Không thể tải dữ liệu khóa học!");
      } finally {
        setSpinning(false);
      }
    };
    fetchData();
  }, []);

  // useEffect để theo dõi sự kiện cuộn và cập nhật active section
  useEffect(() => {
    if (spinning) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -60% 0px",
        threshold: 0,
      }
    );

    const currentRefs = Object.values(sectionRefs)
      .map((ref) => ref.current)
      .filter(Boolean);
    currentRefs.forEach((ref) => observer.observe(ref));

    return () => {
      currentRefs.forEach((ref) => observer.unobserve(ref));
    };
  }, [spinning]); // Chạy lại khi spinning chuyển thành false

  // Phân loại khóa học
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const featuredCourses = allCourses.slice(0, 4);
  const upcomingCourses = allCourses.filter(
    (c) => new Date(c.Start_Date) > today
  );
  const ongoingCourses = allCourses.filter(
    (c) => new Date(c.Start_Date) <= today
  );

  return (
    <div className="homepage">
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Carousel autoplay autoplaySpeed={3000}>
        {[banner, banner2, banner3].map((img, i) => (
          <div className="homepage-banner" key={i}>
            <img src={img} alt={`Banner ${i + 1}`} />
          </div>
        ))}
      </Carousel>
      <Flex className="main-content-wrapper" gap="large">
        <div className="course-status-menu">
          <ul>
            <li>
              <a
                href="#featured"
                className={activeSection === "featured" ? "active" : ""}
              >
                Khóa học nổi bật
              </a>
            </li>
            <li>
              <a
                href="#upcoming"
                className={activeSection === "upcoming" ? "active" : ""}
              >
                Sắp diễn ra
              </a>
            </li>
            <li>
              <a
                href="#ongoing"
                className={activeSection === "ongoing" ? "active" : ""}
              >
                Đang diễn ra
              </a>
            </li>
            <li>
              <a
                href="#finished"
                className={activeSection === "finished" ? "active" : ""}
              >
                Đã kết thúc
              </a>
            </li>
          </ul>
        </div>
        <div className="courses-display">
          <section
            id="featured"
            ref={sectionRefs.featured}
            className="homepage-section"
          >
            <div className="section-header">
              <span>Khóa học nổi bật</span>
            </div>
            <div className="course-list">
              {featuredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </section>
          <section
            id="upcoming"
            ref={sectionRefs.upcoming}
            className="homepage-section"
          >
            <div className="section-header">
              <span>Sắp diễn ra</span>
            </div>
            <div className="course-list">
              {upcomingCourses.length > 0 ? (
                upcomingCourses
                  .slice(0, 4)
                  .map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))
              ) : (
                <p>Hiện chưa có khóa học nào sắp diễn ra.</p>
              )}
            </div>
          </section>
          <section
            id="ongoing"
            ref={sectionRefs.ongoing}
            className="homepage-section"
          >
            <div className="section-header">
              <span>Đang diễn ra</span>
            </div>
            <div className="course-list">
              {ongoingCourses.length > 0 ? (
                ongoingCourses
                  .slice(0, 6)
                  .map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))
              ) : (
                <p>Hiện chưa có khóa học nào đang diễn ra.</p>
              )}
            </div>
          </section>
          <section
            id="finished"
            ref={sectionRefs.finished}
            className="homepage-section"
          >
            <div className="section-header">
              <span>Đã kết thúc</span>
            </div>
            <div className="course-list">
              <p>Chưa có dữ liệu cho các khóa học đã kết thúc.</p>
            </div>
          </section>
        </div>
      </Flex>
    </div>
  );
}

export default Home;
