import { Link, useNavigate } from "react-router-dom";
import banner from "../../../imgs/banner.png";
import banner2 from "../../../imgs/banner2.png";
import banner3 from "../../../imgs/banner3.png";
import "./Home.css";
import { Spin, Carousel, message, Flex, Statistic, Card } from "antd";
import { useEffect, useState, useRef } from "react";
// import { BookOutlined, TeamOutlined, UserOutlined, GlobalOutlined } from '@ant-design/icons';
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import CourseCard from "../../../components/CourseCard/CourseCard";

function Home() {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    languages: 0,
  });
  const [spinning, setSpinning] = useState(true);
  const [activeSection, setActiveSection] = useState("featured");

  const sectionRefs = {
    featured: useRef(null),
    upcoming: useRef(null),
    ongoing: useRef(null),
    discount: useRef(null),
  };

  const { state } = useAuth();
  const { currentUser } = state;
  const userId = currentUser?._id;
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, statsRes] = await Promise.all([
          apiClient.get("/course"),
          apiClient.get("/overview/stats"),
        ]);
        setAllCourses(courseRes.data);
        setStats(statsRes.data);
      } catch (error) {
        messageApi.error("Không thể tải dữ liệu trang chủ!");
      } finally {
        setSpinning(false);
      }
    };
    fetchData();
  }, []);

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Nổi bật
  const featuredCourses = [...allCourses]
    .sort((a, b) => (b.registration_count || 0) - (a.registration_count || 0))
    .slice(0, 8);

  // Sắp diễn ra
  const upcomingCourses = allCourses
    .filter((c) => new Date(c.Start_Date) > today)
    .slice(0, 8);

  // Đang diễn ra
  const ongoingCourses = allCourses
    .filter((c) => new Date(c.Start_Date) <= today && c.status === "ongoing")
    .slice(0, 8);

  // Giảm giá
  const discountCourses = allCourses
    .filter((c) => c.discount_percent > 0 && new Date(c.Start_Date) > today)
    .slice(0, 8);

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
      <div className="stats-cards-container">
        <Card className="stat-card">
          <Statistic
            title="Khóa học đa dạng"
            value={allCourses.length}
            /*prefix={<BookOutlined />}*/ suffix="+"
          />
        </Card>
        <Card className="stat-card">
          <Statistic
            title="Giảng viên kinh nghiệm"
            value={stats.teachers}
            /*prefix={<TeamOutlined />}*/ suffix="+"
          />
        </Card>
        <Card className="stat-card">
          <Statistic
            title="Học viên tin tưởng"
            value={stats.students}
            /*prefix={<UserOutlined />}*/ suffix="+"
          />
        </Card>
        <Card className="stat-card">
          <Statistic
            title="Ngôn ngữ phổ biến"
            value={stats.languages}
            /*prefix={<GlobalOutlined />}*/ suffix="+"
          />
        </Card>
      </div>
      <Flex className="main-content-wrapper" gap="large">
        <div className="course-status-menu">
          <h4>Danh mục khóa học</h4>
          <ul>
            <li>
              <a
                href="#featured"
                className={activeSection === "featured" ? "active" : ""}
              >
                Nổi bật nhất
              </a>
            </li>
            <li>
              <a
                href="#discount"
                className={activeSection === "discount" ? "active" : ""}
              >
                Đang giảm giá
              </a>
            </li>
            <li>
              <a
                href="#upcoming"
                className={activeSection === "upcoming" ? "active" : ""}
              >
                Sắp khai giảng
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
          </ul>
        </div>
        <div className="courses-display">
          <section
            id="featured"
            ref={sectionRefs.featured}
            className="homepage-section"
          >
            <div className="section-header">
              <span>Nổi bật nhất</span>
              {/* <Link to="/courses">
                Xem tất cả <ion-icon name="arrow-forward"></ion-icon>
              </Link> */}
            </div>
            <div className="course-list">
              {featuredCourses.length > 0 ? (
                featuredCourses.map((c) => (
                  <CourseCard key={c._id} course={c} />
                ))
              ) : (
                <p>Chưa có khóa học nổi bật.</p>
              )}
            </div>
          </section>

          <section
            id="discount"
            ref={sectionRefs.discount}
            className="homepage-section"
          >
            <div className="section-header">
              <span>Khuyến mãi hot</span>
            </div>
            <div className="course-list">
              {discountCourses.length > 0 ? (
                discountCourses.map((c) => (
                  <CourseCard key={c._id} course={c} />
                ))
              ) : (
                <p>Hiện không có khóa học nào đang giảm giá.</p>
              )}
            </div>
          </section>

          <section
            id="upcoming"
            ref={sectionRefs.upcoming}
            className="homepage-section"
          >
            <div className="section-header">
              <span>Sắp khai giảng</span>
            </div>
            <div className="course-list">
              {upcomingCourses.length > 0 ? (
                upcomingCourses.map((c) => (
                  <CourseCard key={c._id} course={c} />
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
                ongoingCourses.map((c) => <CourseCard key={c._id} course={c} />)
              ) : (
                <p>Hiện chưa có khóa học nào đang diễn ra.</p>
              )}
            </div>
          </section>
        </div>
      </Flex>
    </div>
  );
}

export default Home;
