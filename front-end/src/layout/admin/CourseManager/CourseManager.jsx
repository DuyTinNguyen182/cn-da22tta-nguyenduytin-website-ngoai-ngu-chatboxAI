import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Flex,
  Breadcrumb,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  message,
  Result,
  DatePicker,
  InputNumber,
  Upload,
  Image,
  Tag,
  Tooltip,
} from "antd";
import { Link } from "react-router-dom";
import { PlusOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";
import ImgCrop from "antd-img-crop";
import courseImagePlaceholder from "../../../imgs/image.png";

function CourseManager() {
  const [open, setOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [courses, setCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [languageLevels, setLanguageLevels] = useState([]);
  const [spinning, setSpinning] = useState(true);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedLanguageId, setSelectedLanguageId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const { state } = useAuth();
  const { currentUser } = state;

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  const getStatusTag = (status) => {
    switch (status) {
      case "upcoming":
        return <Tag color="blue">Sắp diễn ra</Tag>;
      case "ongoing":
        return <Tag color="green">Đang diễn ra</Tag>;
      case "finished":
        return <Tag color="red">Đã kết thúc</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      render: (url) => (
        <Image src={url} width={60} fallback={courseImagePlaceholder} />
      ),
    },
    {
      title: "Mã khóa học",
      dataIndex: "courseid",
      // sorter: (a, b) => a.courseid.localeCompare(b.courseid),
    },
    // { title: "Ngôn ngữ", dataIndex: ["language_id", "language"] },
    {
      title: "Ngôn ngữ",
      dataIndex: "language_id",
      render: (langId) => {
        const id = typeof langId === "object" ? langId?._id : langId;
        const lang = languages.find((l) => l._id === id);
        return lang ? lang.language : "--";
      },
      filters: languages.map((lang) => ({
        text: lang.language,
        value: lang._id,
      })),
      onFilter: (value, record) => {
        if (!record.language_id) return false;
        if (typeof record.language_id === "object") {
          return record.language_id._id === value;
        }
        return record.language_id === value;
      },
    },
    { title: "Trình độ", dataIndex: ["languagelevel_id", "language_level"] },
    { title: "Giảng viên", dataIndex: ["teacher_id", "full_name"], width: 180 },
    {
      title: "Ngày BĐ",
      dataIndex: "Start_Date",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày KT",
      dataIndex: "end_date",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Học phí",
      dataIndex: "Tuition",
      render: (fee, record) => (
        <div>
          {record.discount_percent > 0 && (
            <span style={{ textDecoration: "line-through", color: "#888" }}>
              {fee?.toLocaleString()}₫
            </span>
          )}
          <div style={{ fontWeight: "bold", color: "#d70018" }}>
            {record.discounted_price?.toLocaleString()}₫
          </div>
        </div>
      ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discount_percent",
      render: (percent) => `${percent}%`,
    },
    { title: "Views", dataIndex: "views", sorter: (a, b) => a.views - b.views },
    {
      title: "Đ.Ký",
      dataIndex: "registration_count",
      sorter: (a, b) => a.registration_count - b.registration_count,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: getStatusTag,
      filters: [
        { text: "Sắp diễn ra", value: "upcoming" },
        { text: "Đang diễn ra", value: "ongoing" },
        { text: "Đã kết thúc", value: "finished" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Mô tả",
      dataIndex: "Description",
      render: (text) => (
        <Tooltip title={text}>
          <div className="description-cell">
            {text && text.length > 50 ? `${text.substring(0, 50)}...` : text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Sửa",
      dataIndex: "_id",
      render: (id) => (
        <Link to={`update/${id}`}>
          <EditOutlined style={{ fontSize: "18px" }} />
        </Link>
      ),
      width: 60,
      align: "center",
    },
  ];

  const fetchData = async () => {
    setSpinning(true);
    try {
      const [courseRes, langRes, teacherRes, levelRes] = await Promise.all([
        apiClient.get("/course"),
        apiClient.get("/language"),
        apiClient.get("/teacher"),
        apiClient.get("/languagelevel"),
      ]);

      const coursesWithKey = courseRes.data.map((c) => ({ ...c, key: c._id }));
      setCourses(coursesWithKey);
      setFilteredCourses(coursesWithKey);
      setLanguages(langRes.data);
      setTeachers(teacherRes.data);
      setLanguageLevels(levelRes.data);
    } catch (err) {
      errorMessage("Không thể tải dữ liệu");
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    setSpinning(true);
    try {
      await apiClient.delete(`/course/multiple`, {
        data: { courseIds: selectedRowKeys },
      });
      successMessage(`Đã xóa ${selectedRowKeys.length} khóa học`);
      setSelectedRowKeys([]);
      await fetchData();
    } catch (err) {
      errorMessage(err.response?.data?.message || "Xóa khóa học thất bại");
    } finally {
      setOpenDeleteConfirm(false);
      setSpinning(false);
    }
  };

  const onFinish = async (values) => {
    setSpinning(true);
    const formData = new FormData();

    Object.keys(values).forEach((key) => {
      if (key !== "image") {
        formData.append(key, values[key]);
      }
    });

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    }

    try {
      await apiClient.post(`/course`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      successMessage("Thêm khóa học mới thành công");
      setOpen(false);
      form.resetFields();
      setFileList([]); // Reset file list
      await fetchData();
    } catch (error) {
      errorMessage(error.response?.data?.message || "Thêm khóa học thất bại");
    } finally {
      setSpinning(false);
    }
  };

  const handleSearch = (value) => {
    const keyword = value?.toString().toLowerCase().trim();

    if (!keyword) {
      setFilteredCourses(courses);
      return;
    }

    const filtered = courses.filter((courses) =>
      String(courses.courseid || "")
        .toLowerCase()
        .includes(keyword)
    );

    setFilteredCourses(filtered);
  };

  if (!currentUser || currentUser.role !== "Admin") {
    return (
      <Result
        status="403"
        title="403 - Forbidden"
        subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
        extra={
          <Link to="/">
            <Button type="primary">Quay về Trang chủ</Button>
          </Link>
        }
      />
    );
  }

  return (
    <Flex vertical gap={20} className="CourseManager">
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý khóa học" }]}
      />
      <Flex gap={12}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          Thêm khóa học
        </Button>
        <Input.Search
          placeholder="Tìm theo mã khóa học"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
      </Flex>

      {selectedRowKeys.length > 0 && (
        <Flex
          align="center"
          justify="space-between"
          className="selection-bar"
          style={{
            padding: "10px 15px",
            borderRadius: "5px",
            backgroundColor: "white",
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.15)",
            position: "sticky",
            top: "10px",
            zIndex: 10,
          }}
        >
          <span>Đã chọn {selectedRowKeys.length} khóa học</span>
          <Button
            type="primary"
            danger
            onClick={() => setOpenDeleteConfirm(true)}
          >
            Xoá mục đã chọn
          </Button>
        </Flex>
      )}

      <Table
        rowKey="_id"
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        columns={columns}
        dataSource={filteredCourses}
        bordered
        scroll={{ x: 1500 }}
      />

      <Modal
        open={openDeleteConfirm}
        title="Xác nhận xoá"
        onCancel={() => setOpenDeleteConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setOpenDeleteConfirm(false)}>
            Quay lại
          </Button>,
          <Button key="submit" danger type="primary" onClick={handleDelete}>
            Xoá
          </Button>,
        ]}
        centered
      >
        <p>
          Bạn có chắc muốn xóa vĩnh viễn {selectedRowKeys.length} khóa học đã
          chọn không?
        </p>
      </Modal>

      <Modal
        open={open}
        title="Thêm khóa học mới"
        onCancel={() => {
          setOpen(false);
          setFileList([]);
          form.resetFields();
        }}
        footer={null}
        centered
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Ảnh bìa khóa học" name="image">
            <ImgCrop rotationSlider aspect={16 / 9}>
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList: newFileList }) =>
                  setFileList(newFileList)
                }
                beforeUpload={() => false}
                maxCount={1}
              >
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div>Tải lên</div>
                  </div>
                )}
              </Upload>
            </ImgCrop>
          </Form.Item>

          <Flex gap="middle">
            <Form.Item
              name="language_id"
              label="Ngôn ngữ"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <Select
                placeholder="Chọn ngôn ngữ"
                onChange={(value) => {
                  setSelectedLanguageId(value);
                  form.setFieldsValue({
                    languagelevel_id: null,
                    teacher_id: null,
                  });
                }}
              >
                {languages.map((lang) => (
                  <Select.Option key={lang._id} value={lang._id}>
                    {lang.language}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="languagelevel_id"
              label="Trình độ"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <Select
                placeholder="Chọn trình độ"
                disabled={!selectedLanguageId}
              >
                {languageLevels
                  .filter((level) => {
                    const levelLangId =
                      level.language_id?._id || level.language_id;
                    return levelLangId === selectedLanguageId;
                  })
                  .map((level) => (
                    <Select.Option key={level._id} value={level._id}>
                      {level.language_level}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </Flex>

          <Form.Item
            name="teacher_id"
            label="Giảng viên"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Chọn giảng viên"
              disabled={!selectedLanguageId}
            >
              {teachers
                .filter(
                  (teacher) => teacher.language_id?._id === selectedLanguageId
                )
                .map((teacher) => (
                  <Select.Option key={teacher._id} value={teacher._id}>
                    {teacher.full_name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Flex gap="middle">
            <Form.Item
              name="Start_Date"
              label="Ngày bắt đầu"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                placeholder="Chọn ngày bắt đầu"
              />
            </Form.Item>
            <Form.Item
              name="end_date"
              label="Ngày kết thúc"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                placeholder="Chọn ngày kết thúc"
              />
            </Form.Item>
          </Flex>

          <Flex gap="middle">
            <Form.Item
              name="Number_of_periods"
              label="Số tiết"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Nhập số tiết"
              />
            </Form.Item>
            <Form.Item
              name="Tuition"
              label="Học phí (VNĐ)"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                placeholder="Nhập học phí"
              />
            </Form.Item>
            <Form.Item
              name="discount_percent"
              label="% Giảm giá"
              initialValue={0}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: "100%" }}
                addonAfter="%"
              />
            </Form.Item>
          </Flex>

          <Form.Item name="Description" label="Mô tả">
            <Input.TextArea
              rows={4}
              placeholder="Nhập mô tả chi tiết cho khóa học"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              size="large"
            >
              Tạo khóa học
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}

export default CourseManager;
