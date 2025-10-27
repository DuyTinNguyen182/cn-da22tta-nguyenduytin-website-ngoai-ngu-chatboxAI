import { useEffect, useState } from "react";
import axios from "axios";
import { Spin, message, Button, Select, Space } from "antd";

import { useAuth } from "../../../context/AuthContext";

import apiClient from "../../../api/axiosConfig";

import CourseDetailModal from "../../../components/CourseDetailModal/CourseDetailModal";
import CourseCard from "../../../components/CourseCard/CourseCard";

const { Option } = Select;

function Courses() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [spinning, setSpinning] = useState(false);
  // const [userId, setUserId] = useState(null);

  const { state } = useAuth();
  const { currentUser } = state;
  const userId = currentUser?._id;

  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

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

  // Hàm lấy phần tên sau từ "Tiếng" để sắp xếp
  const getSortKey = (langName) => {
    if (!langName) return "";
    const parts = langName.trim().split(" ");
    return parts.length > 1 ? parts[1] : parts[0];
  };

  // Lấy thông tin user hiện tại
  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:3005/api/user/info", {
  //         withCredentials: true,
  //       });
  //       setUserId(res.data._id);
  //     } catch (err) {
  //       console.error("Không thể lấy thông tin người dùng:", err);
  //     }
  //   };

  //   fetchUserInfo();
  // }, []);

  const handleRegister = async (courseId) => {
    if (!userId) {
      errorMessage("Hãy đăng nhập để tiếp tục!");
      return;
    }
    try {
      const response = await apiClient.post("/registration", {
        user_id: userId,
        course_id: courseId,
      });

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

  // Lấy dữ liệu khóa học (chỉ gọi 1 API)
  const fetchData = async () => {
    setSpinning(true);
    try {
      const courseRes = await apiClient.get("/course");

      const courses = courseRes.data;

      // Lấy danh sách ngôn ngữ duy nhất
      const uniqueLanguages = [
        ...new Map(
          courses.map((c) => [
            c.language_id,
            { _id: c.language_id, language: c.language },
          ])
        ).values(),
      ];

      // Sắp xếp ngôn ngữ
      const sortedLanguages = [...uniqueLanguages].sort((a, b) =>
        getSortKey(a.language).localeCompare(getSortKey(b.language), "vi", {
          sensitivity: "base",
        })
      );

      setFeaturedCourses(courses);
      setLanguages(sortedLanguages);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu khóa học:", error);
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lọc khóa học theo ngôn ngữ và trình độ
  const filteredCourses = featuredCourses.filter((course) => {
    if (selectedLanguage && course.language_id !== selectedLanguage) return false;
    if (selectedLevel && course.languagelevel_id !== selectedLevel) return false;
    return true;
  });

  // Reset filter
  const resetFilters = () => {
    setSelectedLanguage(null);
    setSelectedLevel(null);
  };

  return (
    <div className="allcourses-page">
      {contextHolder} <Spin spinning={spinning} fullscreen />

      {/* Bộ lọc */}
      <div
        className="filters"
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <Space wrap>
          <Select
            allowClear
            style={{ minWidth: 200 }}
            placeholder="Chọn ngôn ngữ"
            value={selectedLanguage || undefined}
            onChange={(value) => {
              setSelectedLanguage(value || null);
              setSelectedLevel(null);
            }}
          >
            {languages.map((lang) => (
              <Option key={lang._id} value={lang._id}>
                {lang.language}
              </Option>
            ))}
          </Select>

          <Select
            allowClear
            style={{ minWidth: 200 }}
            placeholder="Chọn trình độ"
            value={selectedLevel || undefined}
            onChange={(value) => setSelectedLevel(value || null)}
            disabled={!selectedLanguage}
          >
            {featuredCourses
              .filter((c) => c.language_id === selectedLanguage)
              .map((c) => ({
                _id: c.languagelevel_id,
                name: c.languagelevel,
              }))
              .filter(
                (level, index, self) =>
                  level && self.findIndex((l) => l._id === level._id) === index
              ) // loại trùng
              .map((level) => (
                <Option key={level._id} value={level._id}>
                  {level.name}
                </Option>
              ))}
          </Select>

          <Button onClick={resetFilters}>Reset</Button>
        </Space>
      </div>

      {/* Hiển thị danh sách khóa học */}
      {languages.map((lang) => {
        const coursesInLang = filteredCourses.filter(
          (course) => course.language_id === lang._id
        );
        if (coursesInLang.length === 0) return null;

        return (
          <div className="language-group" key={lang._id}>
            <h2>KHÓA HỌC {lang.language.toUpperCase()}</h2>
            <div className="course-list">
              {coursesInLang.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onDetailClick={setSelectedCourse}
                  onRegisterClick={handleRegister}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Modal */}
      <CourseDetailModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  );
}

export default Courses;
