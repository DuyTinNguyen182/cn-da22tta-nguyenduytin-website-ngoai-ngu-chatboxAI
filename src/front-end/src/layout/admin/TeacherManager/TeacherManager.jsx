import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Flex,
  Breadcrumb,
  Badge,
  Modal,
  Form,
  Input,
  Spin,
  Select,
  message,
  Result,
} from "antd";
import { Link } from "react-router-dom";
import {
  SmileOutlined,
  MailOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";

function TeacherManager() {
  const [open, setOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [spinning, setSpinning] = useState(true);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const { state } = useAuth();
  const { currentUser } = state;

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  const columns = [
    {
      title: "Mã giảng viên",
      dataIndex: "teacherid",
    },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      render: (text) => <p style={{ fontWeight: 600 }}>{text}</p>,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 350,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      render: (gender) => (
        <Badge
          color={gender === "Nam" ? "#1890ff" : "#f759ab"}
          count={gender}
        />
      ),
      filters: [
        { text: "Nam", value: "Nam" },
        { text: "Nữ", value: "Nữ" },
      ],
      onFilter: (value, record) => record.gender === value,
      width: 150,
    },
    {
      title: "Ngôn ngữ",
      dataIndex: "language_id",
      render: (langId) => {
        const lang = languages.find((l) => l._id === langId);
        return lang ? lang.language : langId;
      },
      filters: languages.map((lang) => ({
        text: lang.language,
        value: lang._id,
      })),
      onFilter: (value, record) => record.language_id === value,
    },
    {
      title: "Sửa",
      dataIndex: "update",
      render: (_id) => <Link to={`update/${_id}`}>
          <EditOutlined style={{ fontSize: "18px" }} />
        </Link>,
      width: 60,
      align: "center",
    },
  ];

  const fetchData = async () => {
    setSpinning(true);
    try {
      const [teachersRes, languagesRes] = await Promise.all([
        apiClient.get(`/teacher`),
        apiClient.get(`/language`),
      ]);

      const languagesData = languagesRes.data;
      setLanguages(languagesData);

      const dataFormatted = teachersRes.data.map((t) => ({
        key: t._id,
        teacherid: t.teacherid,
        full_name: t.full_name,
        gender: t.gender,
        email: t.email,
        language_id: t.language_id?._id,
        language_name: t.language_id?.language || "N/A",
        update: t._id,
      }));
      setTeachers(dataFormatted);
      setFilteredTeachers(dataFormatted);
    } catch (error) {
      errorMessage("Không thể tải dữ liệu");
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onFinish = async (values) => {
    setSpinning(true);
    try {
      await apiClient.post(`/teacher`, values);
      successMessage("Tạo giảng viên thành công");
      setOpen(false);
      form.resetFields();
      await fetchData();
    } catch (error) {
      errorMessage(error.response?.data?.message || "Tạo giảng viên thất bại");
    } finally {
      setSpinning(false);
    }
  };

  const handleDelete = async () => {
    setSpinning(true);
    try {
      await apiClient.delete(`/teacher/multiple`, {
        data: { teacherIds: selectedRowKeys },
      });
      successMessage(`Đã xóa ${selectedRowKeys.length} giảng viên`);
      setSelectedRowKeys([]);
      await fetchData();
    } catch (error) {
      //   errorMessage(error.response?.data?.message || "Xóa giảng viên thất bại");
      errorMessage(
        "Không thể xóa. Giảng viên này đang dạy khóa học trong hệ thống."
      );
    } finally {
      setOpenDeleteConfirm(false);
      setSpinning(false);
    }
  };

  const searchByName = (value) => {
    const keyword = value?.toString().toLowerCase().trim();
    const result = teachers.filter((t) =>
      String(t.full_name || "")
        .toLowerCase()
        .includes(keyword)
    );
    setFilteredTeachers(result);
  };

  const handleSearch = (value) => {
    const keyword = value?.toString().toLowerCase().trim();

    if (!keyword) {
      setFilteredTeachers(teachers);
      return;
    }

    const filtered = teachers.filter((teachers) =>
      String(teachers.teacherid || "")
        .toLowerCase()
        .includes(keyword)
    );

    setFilteredTeachers(filtered);
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
    <Flex className="TeacherManager" vertical gap={20}>
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý giảng viên" }]}
      />
      <Flex gap={12}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          Thêm giảng viên
        </Button>
        <Input.Search
          placeholder="Tìm theo mã giảng viên"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Input.Search
          placeholder="Tìm theo tên giảng viên"
          onSearch={searchByName}
          onChange={(e) => searchByName(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
      </Flex>

      {selectedRowKeys.length > 0 && (
        <Flex align="center" justify="space-between" className="selection-bar">
          <span>Đã chọn {selectedRowKeys.length} giảng viên</span>
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
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        columns={columns}
        dataSource={filteredTeachers}
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
          <Button key="submit" type="primary" danger onClick={handleDelete}>
            Xoá
          </Button>,
        ]}
        centered
      >
        <p>
          Bạn có chắc muốn xóa {selectedRowKeys.length} giảng viên đã chọn
          không?
        </p>
      </Modal>

      <Modal
        open={open}
        title="Thêm giảng viên mới"
        onCancel={() => setOpen(false)}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ gender: "Nam" }}
        >
          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();

                  if (/\d/.test(value)) {
                    return Promise.reject(
                      "Họ và tên không được chứa ký tự số!"
                    );
                  }

                  if (/[^a-zA-ZÀ-Ỹà-ỹ\s]/.test(value)) {
                    return Promise.reject(
                      "Họ và tên không được chứa ký tự đặc biệt!"
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input prefix={<SmileOutlined />} placeholder="Nhập họ và tên" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Nhập email" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <Select placeholder="Chọn giới tính">
              <Select.Option value="Nam">Nam</Select.Option>
              <Select.Option value="Nữ">Nữ</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="language_id"
            label="Ngôn ngữ giảng dạy"
            rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ!" }]}
          >
            <Select placeholder="Chọn ngôn ngữ">
              {languages.map((lang) => (
                <Select.Option key={lang._id} value={lang._id}>
                  {lang.language}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Tạo giảng viên
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}

export default TeacherManager;
