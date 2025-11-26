import { useEffect, useState } from "react";
import {
  Spin,
  message,
  Button,
  Select,
  Radio,
  Slider,
  Space,
  Empty,
} from "antd";
import {
  FilterOutlined,
  SortAscendingOutlined,
  DollarOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import CourseCard from "../../../components/CourseCard/CourseCard";

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
  const [sortBy, setSortBy] = useState("views");
  const [visibleCount, setVisibleCount] = useState(12);

  const { state } = useAuth();
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
        messageApi.error("Không thể tải dữ liệu");
      } finally {
        setSpinning(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const processedCourses = allCourses
    .filter((course) => {
      const { language, level, status, priceRange } = filters;
      if (language && course.language_id?._id !== language) return false;
      if (level && course.languagelevel_id?._id !== level) return false;
      if (status && course.status !== status) return false;
      if (
        course.discounted_price < priceRange[0] ||
        course.discounted_price > priceRange[1]
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "registrations":
          return (b.registration_count || 0) - (a.registration_count || 0);
        case "views":
          return (b.views || 0) - (a.views || 0);
        case "price_asc":
          return (a.discounted_price || 0) - (b.discounted_price || 0);
        case "price_desc":
          return (b.discounted_price || 0) - (a.discounted_price || 0);
        default:
          return 0;
      }
    });

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  if (spinning) {
    return (
      <Spin fullscreen tip="Đang tải danh sách khóa học..." size="large" />
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F2F4F7] py-2 pb-20">
      {contextHolder}

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-700 flex items-center gap-3">
            <AppstoreOutlined className="text-blue-600" />
            Tìm kiếm khóa học phù hợp với trình độ và mục tiêu của bạn
          </h1>
          {/* <p className="text-gray-500 mt-2">
            Tìm kiếm khóa học phù hợp với trình độ và mục tiêu của bạn
          </p> */}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-1/4 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <FilterOutlined className="text-lg text-blue-600" />
                <h3 className="font-bold text-gray-800 text-lg">
                  Bộ lọc tìm kiếm
                </h3>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <GlobalOutlined /> Thông tin khóa học
                </h4>
                <div className="flex flex-col gap-3">
                  <Select
                    allowClear
                    placeholder="Chọn ngôn ngữ"
                    className="w-full"
                    size="large"
                    value={filters.language}
                    onChange={(value) => handleFilterChange("language", value)}
                  >
                    {languages.map((lang) => (
                      <Option key={lang._id} value={lang._id}>
                        {lang.language}
                      </Option>
                    ))}
                  </Select>
                  <Select
                    allowClear
                    placeholder="Chọn trình độ"
                    className="w-full"
                    size="large"
                    value={filters.level}
                    onChange={(value) => handleFilterChange("level", value)}
                    disabled={!filters.language}
                  >
                    {languageLevels.map((level) => (
                      <Option key={level._id} value={level._id}>
                        {level.language_level}
                      </Option>
                    ))}
                  </Select>
                  <Select
                    allowClear
                    placeholder="Trạng thái lớp"
                    className="w-full"
                    size="large"
                    value={filters.status}
                    onChange={(value) => handleFilterChange("status", value)}
                  >
                    <Option value="upcoming">Sắp diễn ra</Option>
                    <Option value="ongoing">Đang diễn ra</Option>
                    <Option value="finished">Đã kết thúc</Option>
                  </Select>
                </div>
              </div>

              <div className="mb-6 pt-6 border-t border-dashed border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <DollarOutlined /> Khoảng giá
                </h4>
                <Slider
                  range
                  min={0}
                  max={10000000}
                  step={100000}
                  defaultValue={[0, 10000000]}
                  onAfterChange={(value) =>
                    handleFilterChange("priceRange", value)
                  }
                  tipFormatter={(value) => `${value.toLocaleString()}₫`}
                  trackStyle={[{ backgroundColor: "#2563eb" }]}
                  handleStyle={[
                    { borderColor: "#2563eb" },
                    { borderColor: "#2563eb" },
                  ]}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                  <span>0₫</span>
                  <span>10.000.000₫</span>
                </div>
              </div>

              <div className="pt-6 border-t border-dashed border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <SortAscendingOutlined /> Sắp xếp theo
                </h4>
                <Radio.Group
                  onChange={(e) => setSortBy(e.target.value)}
                  value={sortBy}
                  className="w-full"
                >
                  <Space direction="vertical" className="w-full">
                    <Radio value="registrations" className="!text-gray-600">
                      Lượt đăng ký nhiều nhất
                    </Radio>
                    <Radio value="views" className="!text-gray-600">
                      Lượt xem nhiều nhất
                    </Radio>
                    <Radio value="price_asc" className="!text-gray-600">
                      Giá thấp đến cao
                    </Radio>
                    <Radio value="price_desc" className="!text-gray-600">
                      Giá cao đến thấp
                    </Radio>
                  </Space>
                </Radio.Group>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 w-full">
            <div className="mb-4 text-gray-500 font-medium text-sm flex justify-between items-center">
              <span>
                Tìm thấy{" "}
                <strong className="text-gray-900">
                  {processedCourses.length}
                </strong>{" "}
                khóa học phù hợp
              </span>
            </div>

            {processedCourses.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4  gap-4 md:gap-6">
                  {processedCourses.slice(0, visibleCount).map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>

                {visibleCount < processedCourses.length && (
                  <div className="flex justify-center mt-10">
                    <Button
                      onClick={handleShowMore}
                      size="large"
                      className="!px-10 !h-12 !rounded-full !font-semibold !border-blue-600 !text-blue-600 hover:!bg-blue-50"
                    >
                      Xem thêm khóa học
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200 shadow-sm mt-4">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-gray-500 text-base">
                      Không tìm thấy khóa học nào phù hợp với bộ lọc hiện tại.
                    </span>
                  }
                />
                <Button
                  type="primary"
                  onClick={() => {
                    setFilters({
                      language: null,
                      level: null,
                      status: null,
                      priceRange: [0, 10000000],
                    });
                    setSortBy("views");
                  }}
                  className="mt-4 bg-blue-600"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Courses;
