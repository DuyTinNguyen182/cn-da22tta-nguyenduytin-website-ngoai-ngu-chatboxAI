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
  AutoComplete,
  Input,
  Tag,
} from "antd";
import {
  FilterOutlined,
  SortAscendingOutlined,
  DollarOutlined,
  GlobalOutlined,
  SearchOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import CourseCard from "../../../components/CourseCard/CourseCard";

const { Option } = Select;

function Courses() {
  const [allCourses, setAllCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [languageLevels, setLanguageLevels] = useState([]);
  const [spinning, setSpinning] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [options, setOptions] = useState([]);
  const [tempPriceRange, setTempPriceRange] = useState([0, 10000000]);

  const [filters, setFilters] = useState({
    language: searchParams.get("language") || null,
    level: searchParams.get("level") || null,
    status: searchParams.get("status") || null,
    priceRange: [
      Number(searchParams.get("minPrice")) || 0,
      Number(searchParams.get("maxPrice")) || 10000000,
    ],
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "views");
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

  useEffect(() => {
    const params = {};

    if (keyword) params.keyword = keyword;
    if (sortBy !== "views") params.sort = sortBy;

    if (filters.language) params.language = filters.language;
    if (filters.level) params.level = filters.level;
    if (filters.status) params.status = filters.status;

    if (filters.priceRange[0] !== 0) params.minPrice = filters.priceRange[0];
    if (filters.priceRange[1] !== 10000000)
      params.maxPrice = filters.priceRange[1];

    setSearchParams(params);
  }, [filters, keyword, sortBy, setSearchParams]);

  useEffect(() => {
    setTempPriceRange(filters.priceRange);
  }, [filters.priceRange]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // --- LOGIC AUTOCOMPLETE ---
  const handleSearch = (searchText) => {
    setKeyword(searchText);
    if (!searchText) {
      setOptions([]);
      return;
    }
    const text = searchText.toLowerCase();
    const suggestions = new Set();
    allCourses.forEach((course) => {
      const lang = course.language_id?.language;
      const level = course.languagelevel_id?.language_level;
      const teacher = course.teacher_id?.full_name;
      const combined = `${lang} - Trình độ ${level}`;
      if (lang?.toLowerCase().includes(text)) suggestions.add(lang);
      if (teacher?.toLowerCase().includes(text)) suggestions.add(teacher);
      if ((lang + " " + level).toLowerCase().includes(text))
        suggestions.add(combined);
    });
    setOptions([...suggestions].slice(0, 10).map((val) => ({ value: val })));
  };

  const handleSelect = (value) => setKeyword(value);

  // --- LOGIC LỌC ---
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

      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        const searchableText = `
            ${course.courseid} 
            ${course.language_id?.language} 
            ${course.languagelevel_id?.language_level} 
            ${course.teacher_id?.full_name}
            ${course.language_id?.language} - Trình độ ${course.languagelevel_id?.language_level}
        `.toLowerCase();
        if (!searchableText.includes(lowerKeyword)) return false;
      }
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

  const handleShowMore = () => setVisibleCount((prev) => prev + 8);

  const hasActiveFilters =
    keyword.trim() !== "" ||
    filters.language !== null ||
    filters.level !== null ||
    filters.status !== null ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 10000000;

  const clearAllFilters = () => {
    setFilters({
      language: null,
      level: null,
      status: null,
      priceRange: [0, 10000000],
    });
    setKeyword("");
    setSortBy("views");
    setSearchParams({});
  };

  if (spinning)
    return (
      <Spin fullscreen tip="Đang tải danh sách khóa học..." size="large" />
    );

  return (
    <div className="w-full min-h-screen bg-[#F2F4F7] pb-20">
      {contextHolder}

      <div className="bg-gradient-to-r from-blue-900 to-indigo-700 pt-10 pb-14 px-4 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-wide">
            Khám phá các khóa học tại DREAM
          </h3>
          <div className="bg-white p-1 rounded-full shadow-2xl flex items-center max-w-2xl mx-auto">
            <AutoComplete
              options={options}
              onSelect={handleSelect}
              onSearch={handleSearch}
              className="w-full"
              size="large"
              value={keyword}
              onChange={(val) => setKeyword(val)}
              backfill
            >
              <Input
                size="large"
                placeholder="Tìm khóa học, ngôn ngữ, trình độ (VD: Tiếng Anh B1)..."
                prefix={
                  <SearchOutlined className="text-gray-400 text-lg ml-2" />
                }
                className="!border-none !shadow-none focus:!shadow-none text-gray-700 text-base"
                allowClear
              />
            </AutoComplete>
            <Button
              type="primary"
              size="large"
              className="!rounded-full !h-12 !px-8 !bg-blue-600 !border-none hover:!bg-blue-500 !font-semibold !text-base shadow-md"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-5">
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
                    {languageLevels
                      .filter((level) => {
                        if (!filters.language) return true;
                        const levelLangId =
                          level.language_id?._id || level.language_id;
                        return levelLangId === filters.language;
                      })
                      .map((level) => (
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
                  value={tempPriceRange}
                  onChange={(value) => setTempPriceRange(value)}
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
            {hasActiveFilters && (
              <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 animate-fade-in shadow-sm">
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  <CheckCircleOutlined className="text-blue-600" />
                  Tìm thấy{" "}
                  <strong className="text-blue-600 text-lg">
                    {processedCourses.length}
                  </strong>{" "}
                  kết quả phù hợp
                </span>

                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={clearAllFilters}
                  className="shadow-md hover:scale-105 transition-transform font-semibold"
                >
                  Xóa tất cả lọc
                </Button>
              </div>
            )}

            {processedCourses.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-3">
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
                      Không tìm thấy khóa học nào phù hợp.
                    </span>
                  }
                />
                <Button
                  type="primary"
                  onClick={clearAllFilters}
                  className="mt-4 bg-blue-600"
                >
                  Xóa bộ lọc & Tìm kiếm lại
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
