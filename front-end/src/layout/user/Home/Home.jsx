import { Link, useNavigate } from "react-router-dom";
import bannerFallback from "../../../imgs/banner.png";
import { Spin, Carousel, message } from "antd";
import { useEffect, useState, useRef } from "react";
import apiClient from "../../../api/axiosConfig";
import CourseCard from "../../../components/CourseCard/CourseCard";
import { useAuth } from "../../../context/AuthContext";

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
  const [slides, setSlides] = useState([]);

  const sectionRefs = {
    featured: useRef(null),
    upcoming: useRef(null),
    ongoing: useRef(null),
    discount: useRef(null),
  };

  const { state } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, statsRes, slideRes] = await Promise.all([
          apiClient.get("/course"),
          apiClient.get("/overview/stats"),
          apiClient.get("/slideshow/active"),
        ]);
        setAllCourses(courseRes.data);
        setStats(statsRes.data);
        setSlides(slideRes.data);
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
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -60% 0px", threshold: 0 }
    );
    const currentRefs = Object.values(sectionRefs)
      .map((ref) => ref.current)
      .filter(Boolean);
    currentRefs.forEach((ref) => observer.observe(ref));
    return () => currentRefs.forEach((ref) => observer.unobserve(ref));
  }, [spinning]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const featuredCourses = [...allCourses]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 8);

  const upcomingCourses = allCourses
    .filter((c) => new Date(c.Start_Date) > today)
    .slice(0, 8);

  const ongoingCourses = allCourses
    .filter((c) => new Date(c.Start_Date) <= today && c.status === "ongoing")
    .slice(0, 8);

  const discountCourses = allCourses
    .filter((c) => c.discount_percent > 0 && new Date(c.Start_Date) > today)
    .slice(0, 8);

  const StatCard = ({ title, value, iconName, colorClass }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="relative z-10">
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}+</h3>
      </div>
      <div
        className={`absolute -right-2 -bottom-4 text-6xl opacity-10 group-hover:scale-110 transition-transform duration-300 ${colorClass}`}
      >
        <ion-icon name={iconName}></ion-icon>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pt-12 md:pt-0 md:pb-20">
      {contextHolder}
      <Spin spinning={spinning} fullscreen />

      <div className="w-full max-w-7xl mx-auto pt-6 px-4 md:px-6">
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <Carousel autoplay autoplaySpeed={3000} effect="fade">
            {slides.length > 0 ? (
              slides.map((slide) => (
                <div
                  key={slide._id}
                  className="w-full h-[130px] md:h-[350px] lg:h-[300px]"
                >
                  <img
                    src={slide.image}
                    alt={slide.title || "Banner"}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ))
            ) : (
              <div className="w-full h-[200px] md:h-[350px] lg:h-[300px]">
                <img
                  src={bannerFallback}
                  alt="Default Banner"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}
          </Carousel>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          <StatCard
            title="Khóa học đa dạng"
            value={allCourses.length}
            iconName="book"
            colorClass="text-blue-600"
          />
          <StatCard
            title="Giảng viên kinh nghiệm"
            value={stats.teachers}
            iconName="people"
            colorClass="text-green-600"
          />
          <StatCard
            title="Học viên tin tưởng"
            value={stats.students}
            iconName="school"
            colorClass="text-orange-600"
          />
          <StatCard
            title="Ngôn ngữ phổ biến"
            value={stats.languages}
            iconName="globe"
            colorClass="text-purple-600"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12 flex flex-col lg:flex-row gap-10 items-start">
        <aside className="hidden lg:block w-64 sticky top-24 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <ion-icon name="list-outline" class="text-blue-600"></ion-icon>
              Danh mục
            </h4>
            <ul className="flex flex-col gap-1">
              {[
                { id: "featured", label: "Nổi bật nhất", icon: "star-outline" },
                {
                  id: "discount",
                  label: "Đang giảm giá",
                  icon: "pricetag-outline",
                },
                {
                  id: "upcoming",
                  label: "Sắp khai giảng",
                  icon: "calendar-outline",
                },
                {
                  id: "ongoing",
                  label: "Đang diễn ra",
                  icon: "play-circle-outline",
                },
              ].map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeSection === item.id
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                  >
                    <ion-icon name={item.icon}></ion-icon>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-1 flex flex-col gap-10 w-full">
          <section
            id="featured"
            ref={sectionRefs.featured}
            className="scroll-mt-28"
          >
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-yellow-500 text-3xl">
                  <ion-icon name="trophy"></ion-icon>
                </span>
                Nổi bật nhất
              </h2>
              <Link
                to="/courses"
                className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                Xem tất cả <ion-icon name="arrow-forward"></ion-icon>
              </Link>
            </div>

            {featuredCourses.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {featuredCourses.map((c) => (
                  <CourseCard key={c._id} course={c} />
                ))}
              </div>
            ) : (
              <EmptyState message="Chưa có khóa học nổi bật." />
            )}
          </section>

          <section
            id="discount"
            ref={sectionRefs.discount}
            className="scroll-mt-28"
          >
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-red-500 text-3xl">
                  <ion-icon name="flame"></ion-icon>
                </span>
                Khuyến mãi hot
              </h2>
            </div>
            {discountCourses.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {discountCourses.map((c) => (
                  <CourseCard key={c._id} course={c} />
                ))}
              </div>
            ) : (
              <EmptyState message="Hiện không có khóa học nào đang giảm giá." />
            )}
          </section>

          <section
            id="upcoming"
            ref={sectionRefs.upcoming}
            className="scroll-mt-28"
          >
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-blue-500 text-3xl">
                  <ion-icon name="calendar-number"></ion-icon>
                </span>
                Sắp khai giảng
              </h2>
            </div>
            {upcomingCourses.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {upcomingCourses.map((c) => (
                  <CourseCard key={c._id} course={c} />
                ))}
              </div>
            ) : (
              <EmptyState message="Hiện chưa có khóa học nào sắp diễn ra." />
            )}
          </section>

          <section
            id="ongoing"
            ref={sectionRefs.ongoing}
            className="scroll-mt-28"
          >
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-green-500 text-3xl">
                  <ion-icon name="play-circle"></ion-icon>
                </span>
                Đang diễn ra
              </h2>
            </div>
            {ongoingCourses.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {ongoingCourses.map((c) => (
                  <CourseCard key={c._id} course={c} />
                ))}
              </div>
            ) : (
              <EmptyState message="Hiện chưa có khóa học nào đang diễn ra." />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
    <div className="text-4xl text-gray-300 mb-2">
      <ion-icon name="file-tray-outline"></ion-icon>
    </div>
    <p className="text-gray-500 font-medium">{message}</p>
  </div>
);

export default Home;
