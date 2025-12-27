import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Flex,
  Breadcrumb,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Space,
  Popconfirm,
  Result,
} from "antd";
import { Link } from "react-router-dom";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";

function ClassSessionManager() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { state } = useAuth();
  const { currentUser } = state;

  const successMessage = (msg) => messageApi.success(msg);
  const errorMessage = (msg) => messageApi.error(msg);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/class-sessions");
      const dataWithKey = res.data.map((item) => ({ ...item, key: item._id }));
      setSessions(dataWithKey);
    } catch (err) {
      errorMessage("Không thể tải danh sách buổi học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingSession(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingSession(record);
    form.setFieldsValue({
      days: record.days,
      time: record.time,
    });
    setModalOpen(true);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (editingSession) {
        await apiClient.put(`/class-sessions/${editingSession._id}`, values);
        successMessage("Cập nhật buổi học thành công!");
      } else {
        await apiClient.post("/class-sessions", values);
        successMessage("Thêm buổi học mới thành công!");
      }
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      errorMessage(error.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/class-sessions/${id}`);
      successMessage("Đã xóa buổi học.");
      fetchData();
    } catch (error) {
      errorMessage("Xóa thất bại.");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await apiClient.delete("/class-sessions/multiple", {
        data: { ids: selectedRowKeys },
      });
      successMessage(`Đã xóa ${selectedRowKeys.length} mục.`);
      setSelectedRowKeys([]);
      fetchData();
    } catch (error) {
      errorMessage("Xóa nhiều thất bại.");
    }
  };

  const columns = [
    {
      title: "Thứ / Ngày học",
      dataIndex: "days",
      width: 250,
      render: (text) => (
        <Space>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: "Khung giờ",
      dataIndex: "time",
      width: 250,
      render: (text) => (
        <Space>
          <ClockCircleOutlined style={{ color: "#52c41a" }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "orange" }} />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa buổi học này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!currentUser || currentUser.role !== "Admin") {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
        extra={
          <Link to="/">
            <Button type="primary">Về trang chủ</Button>
          </Link>
        }
      />
    );
  }

  return (
    <Flex vertical gap={20} style={{ padding: "20px" }}>
      {contextHolder}
      <Spin spinning={loading} fullscreen />

      <Breadcrumb
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý Buổi học" }]}
      />

      <Flex gap={12} justify="space-between" align="center">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm khung giờ
          </Button>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`Xóa ${selectedRowKeys.length} mục đã chọn?`}
              onConfirm={handleBulkDelete}
            >
              <Button type="primary" danger icon={<DeleteOutlined />}>
                Xóa {selectedRowKeys.length} mục
              </Button>
            </Popconfirm>
          )}
        </Space>
        <Button icon={<ReloadOutlined />} onClick={fetchData}>
          Làm mới
        </Button>
      </Flex>

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        columns={columns}
        dataSource={sessions}
        rowKey="_id"
        bordered
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editingSession ? "Chỉnh sửa Khung giờ" : "Thêm Khung giờ mới"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ days: "", time: "" }}
        >
          <Form.Item
            name="days"
            label="Các ngày học trong tuần"
            rules={[{ required: true, message: "Vui lòng nhập các ngày học!" }]}
            help="Ví dụ: Thứ 2 - 4 - 6, hoặc Thứ 3 - 5 - 7"
          >
            <Input placeholder="Nhập ngày học (VD: Thứ 2 - 4 - 6)" />
          </Form.Item>

          <Form.Item
            name="time"
            label="Khung giờ học"
            rules={[{ required: true, message: "Vui lòng nhập khung giờ!" }]}
            help="Ví dụ: 19:00 - 21:00"
          >
            <Input placeholder="Nhập giờ học (VD: 17:45 - 19:15)" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Flex gap={10} justify="end">
              <Button onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingSession ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}

export default ClassSessionManager;
