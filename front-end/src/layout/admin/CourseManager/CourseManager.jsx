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
} from "antd";
import { Link } from "react-router-dom";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";

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
  const [form] = Form.useForm();
  const { state } = useAuth();
  const { currentUser } = state;

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  const columns = [
    { title: "Mã khóa học", dataIndex: "courseid" },
    {
      title: "Ngôn ngữ",
      dataIndex: ["language_id", "language"],
      filters: languages.map((lang) => ({
        text: lang.language,
        value: lang._id,
      })),
      onFilter: (value, record) => record.language_id?._id === value,
    },
    { title: "Trình độ", dataIndex: ["languagelevel_id", "language_level"] },
    { title: "Giảng viên", dataIndex: ["teacher_id", "full_name"], width: 200 },
    {
      title: "Ngày bắt đầu",
      dataIndex: "Start_Date",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    { title: "Số tiết", dataIndex: "Number_of_periods" },
    {
      title: "Học phí (VNĐ)",
      dataIndex: "Tuition",
      render: (fee) => fee?.toLocaleString() + " ₫",
    },
    {
      title: "Mô tả",
      dataIndex: "Description",
      width: 250,
    },
    {
      title: "Sửa",
      dataIndex: "_id",
      render: (id) => (
        <Link to={`update/${id}`}>
          <EditOutlined
            style={{ color: "#1997ffff", fontSize: "18px", cursor: "pointer" }}
          />
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
    try {
      const formattedValues = {
        ...values,
        Start_Date: moment(values.Start_Date).toISOString(),
      };
      await apiClient.post(`/course`, formattedValues);
      successMessage("Thêm khóa học mới thành công");
      setOpen(false);
      form.resetFields();
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
    <Flex vertical gap={20}>
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
          setSelectedLanguageId(null);
        }}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="language_id"
            label="Ngôn ngữ"
            rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ!" }]}
          >
            <Select
              placeholder="Chọn ngôn ngữ"
              onChange={setSelectedLanguageId}
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
            rules={[{ required: true, message: "Vui lòng chọn trình độ!" }]}
          >
            <Select placeholder="Chọn trình độ">
              {languageLevels.map((level) => (
                <Select.Option key={level._id} value={level._id}>
                  {level.language_level}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="teacher_id"
            label="Giảng viên"
            rules={[{ required: true, message: "Vui lòng chọn giảng viên!" }]}
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
          <Form.Item
            name="Start_Date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < moment().startOf("day")
              }
            />
          </Form.Item>
          <Form.Item
            name="Number_of_periods"
            label="Số tiết"
            rules={[{ required: true, message: "Vui lòng nhập số tiết!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="Tuition"
            label="Học phí (VNĐ)"
            rules={[{ required: true, message: "Vui lòng nhập học phí!" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <Form.Item name="Description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Tạo khóa học
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}

export default CourseManager;
