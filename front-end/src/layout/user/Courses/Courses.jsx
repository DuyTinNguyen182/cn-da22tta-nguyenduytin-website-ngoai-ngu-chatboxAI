import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, message, Button, Select, Space } from "antd";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import CourseCard from "../../../components/CourseCard/CourseCard";

const { Option } = Select;

function Courses() {
  const navigate = useNavigate();
  // const [selectedCourse, setSelectedCourse] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [spinning, setSpinning] = useState(true);

  const { state } = useAuth();
  const { currentUser } = state;
  const userId = currentUser?._id;

  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  const handleRegister = async (courseId) => {
    if (!userId) {
      errorMessage("Hãy đăng nhập để tiếp tục!");
      return;
    }
    try {
      await apiClient.post("/registration", {
        user_id: userId,
        course_id: courseId,
      });
      successMessage("Đăng ký thành công!");
      setTimeout(() => {
        navigate(`/my-courses/${userId}`);
      }, 1000);
    } catch (error) {
      errorMessage(error.response?.data?.message || "Đăng ký thất bại.");
    }
  };

  const fetchData = async () => {
    try {
      const courseRes = await apiClient.get("/course");
      const courses = courseRes.data;
      setAllCourses(courses);

      const uniqueLanguages = [
        ...new Map(
          courses
            .filter((c) => c.language_id)
            .map((c) => [
              c.language_id._id,
              { _id: c.language_id._id, language: c.language_id.language },
            ])
        ).values(),
      ];

      setLanguages(
        uniqueLanguages.sort((a, b) =>
          a.language.localeCompare(b.language, "vi")
        )
      );
    } catch (error) {
      errorMessage("Không thể tải dữ liệu khóa học");
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCourses = allCourses.filter((course) => {
    if (selectedLanguage && course.language_id?._id !== selectedLanguage)
      return false;
    if (selectedLevel && course.languagelevel_id?._id !== selectedLevel)
      return false;
    return true;
  });

  const resetFilters = () => {
    setSelectedLanguage(null);
    setSelectedLevel(null);
  };

  if (spinning) {
    return <Spin fullscreen tip="Đang tải danh sách khóa học..." />;
  }

  return (
    <div className="allcourses-page">
      {contextHolder}
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
            placeholder="Lọc theo ngôn ngữ"
            value={selectedLanguage}
            onChange={(value) => {
              setSelectedLanguage(value);
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
            placeholder="Lọc theo trình độ"
            value={selectedLevel}
            onChange={setSelectedLevel}
            disabled={!selectedLanguage}
          >
            {[
              ...new Map(
                allCourses
                  .filter(
                    (c) =>
                      c.language_id?._id === selectedLanguage &&
                      c.languagelevel_id
                  )
                  .map((c) => [c.languagelevel_id._id, c.languagelevel_id])
              ).values(),
            ].map((level) => (
              <Option key={level._id} value={level._id}>
                {level.language_level}
              </Option>
            ))}
          </Select>

          <Button onClick={resetFilters}>Reset</Button>
        </Space>
      </div>

      {languages.map((lang) => {
        const coursesInLang = filteredCourses.filter(
          (course) => course.language_id?._id === lang._id
        );
        if (coursesInLang.length === 0) return null;

        return (
          <div className="language-group" key={lang._id}>
            <h2>KHÓA HỌC {lang.language?.toUpperCase()}</h2>
            <div className="course-list">
              {coursesInLang.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  // onDetailClick={setSelectedCourse}
                  onRegisterClick={handleRegister}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* <CourseDetailModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      /> */}
    </div>
  );
}

export default Courses;
