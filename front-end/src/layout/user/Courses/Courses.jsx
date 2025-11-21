import { useEffect, useState } from "react";
import { Spin, message, Button, Select, Radio, Slider, Space } from 'antd';
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import CourseCard from "../../../components/CourseCard/CourseCard";
import "./Courses.css";

const { Option } = Select;

function Courses() {
  const [allCourses, setAllCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [languageLevels, setLanguageLevels] = useState([]);
  const [spinning, setSpinning] = useState(true);

  const [filters, setFilters] = useState({
    language: null,
    level: null,
    status: null,
    priceRange: [0, 10000000],
  });
  const [sortBy, setSortBy] = useState('views');
  const [visibleCount, setVisibleCount] = useState(12);

  const { state } = useAuth();
  const { currentUser } = state;
  const userId = currentUser?._id;
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, langRes, levelRes] = await Promise.all([
          apiClient.get("/course"),
          apiClient.get("/language"),
          apiClient.get("/languagelevel"),
        ]);
        setAllCourses(courseRes.data);
        setLanguages(langRes.data);
        setLanguageLevels(levelRes.data);
      } catch (error) {
        message.error("Không thể tải dữ liệu");
      } finally {
        setSpinning(false);
      }
    };
    fetchData();
  }, []);
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const processedCourses = allCourses
    .filter(course => {
      const { language, level, status, priceRange } = filters;
      if (language && course.language_id?._id !== language) return false;
      if (level && course.languagelevel_id?._id !== level) return false;
      if (status && course.status !== status) return false;
      if (course.discounted_price < priceRange[0] || course.discounted_price > priceRange[1]) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'registrations':
          return (b.registration_count || 0) - (a.registration_count || 0);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'price_asc':
          return (a.discounted_price || 0) - (b.discounted_price || 0);
        case 'price_desc':
          return (b.discounted_price || 0) - (a.discounted_price || 0);
        default:
          return 0;
      }
    });

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 8);
  };
  
  if (spinning) {
    return <Spin fullscreen tip="Đang tải danh sách khóa học..." />;
  }

  return (
    <div className="all-courses-container">
      {contextHolder}
      <div className="filter-panel">
        <div className="filter-group">
          <h4>Lọc theo:</h4>
          <Select
            allowClear
            placeholder="Ngôn ngữ"
            value={filters.language}
            onChange={(value) => handleFilterChange('language', value)}
          >
            {languages.map(lang => <Option key={lang._id} value={lang._id}>{lang.language}</Option>)}
          </Select>
          <Select
            allowClear
            placeholder="Trình độ"
            value={filters.level}
            onChange={(value) => handleFilterChange('level', value)}
            disabled={!filters.language}
          >
             {languageLevels.map(level => <Option key={level._id} value={level._id}>{level.language_level}</Option>)}
          </Select>
          <Select
            allowClear
            placeholder="Trạng thái"
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
          >
            <Option value="upcoming">Sắp diễn ra</Option>
            <Option value="ongoing">Đang diễn ra</Option>
            <Option value="finished">Đã kết thúc</Option>
          </Select>
        </div>

        <div className="filter-group">
            <h4>Lọc theo mức giá:</h4>
            <Slider 
                range 
                min={0} 
                max={10000000} 
                step={100000}
                defaultValue={[0, 10000000]} 
                onAfterChange={(value) => handleFilterChange('priceRange', value)}
                tipFormatter={value => `${value.toLocaleString()}₫`}
            />
        </div>

        <div className="filter-group">
          <h4>Sắp xếp theo:</h4>
          <Radio.Group onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
            <Space direction="vertical">
              <Radio value="registrations">Lượt đăng ký</Radio>
              <Radio value="views">Lượt xem</Radio>
              <Radio value="price_asc">Giá tăng dần</Radio>
              <Radio value="price_desc">Giá giảm dần</Radio>
            </Space>
          </Radio.Group>
        </div>
      </div>

      <div className="courses-grid-panel">
        <div className="courses-grid">
          {processedCourses.slice(0, visibleCount).map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
        {processedCourses.length === 0 && <p>Không tìm thấy khóa học nào phù hợp.</p>}
        {visibleCount < processedCourses.length && (
          <div className="show-more-container">
            <Button onClick={handleShowMore}>Xem thêm</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;