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
  Switch,
  InputNumber,
  Upload,
  Image,
  Tag,
  Popconfirm,
} from "antd";
import { Link } from "react-router-dom";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import apiClient from "../../../api/axiosConfig";

function SlideshowManager() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fileList, setFileList] = useState([]);

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/slideshow");
      setSlides(res.data);
    } catch (error) {
      messageApi.error("Không thể tải danh sách slideshow");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (values) => {
    if (fileList.length === 0) {
      messageApi.error("Vui lòng chọn ảnh!");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title || "");
      formData.append("order", values.order || 0);
      formData.append("isActive", values.isActive);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      await apiClient.post("/slideshow", formData);

      messageApi.success("Thêm banner thành công!");
      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);
      fetchData();
    } catch (error) {
      messageApi.error(error.response?.data?.message || "Lỗi khi thêm mới");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/slideshow/${id}`);
      messageApi.success("Đã xóa banner");
      fetchData();
    } catch (error) {
      messageApi.error("Xóa thất bại");
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const columns = [
    {
      title: "Ảnh Banner",
      dataIndex: "image",
      key: "image",
      width: 200,
      render: (src) => (
        <Image
          width={160}
          height={90}
          src={src}
          style={{
            objectFit: "cover",
            borderRadius: 8,
            border: "1px solid #eee",
          }}
          fallback="https://via.placeholder.com/160x90?text=No+Image"
        />
      ),
    },
    {
      title: "Tiêu đề (Alt)",
      dataIndex: "title",
      key: "title",
      render: (text) =>
        text || <span style={{ color: "#999" }}>Không có tiêu đề</span>,
    },
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      width: 100,
      align: "center",
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      align: "center",
      render: (active) =>
        active ? (
          <Tag color="green">Hiển thị</Tag>
        ) : (
          <Tag color="red">Đang ẩn</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Flex gap="small" justify="center">
          <Link to={`update/${record._id}`}>
            <Button icon={<EditOutlined />} type="default" size="middle" />
          </Link>
          <Popconfirm
            title="Xóa banner này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button
              icon={<DeleteOutlined />}
              type="primary"
              danger
              size="middle"
            />
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  return (
    <Flex vertical gap={20}>
      {contextHolder}
      <Breadcrumb
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý Slideshow" }]}
      />

      <Flex justify="space-between" align="center">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setIsModalOpen(true);
            setFileList([]);
            form.resetFields();
          }}
          size="large"
        >
          Thêm Banner Mới
        </Button>
      </Flex>

      <Table
        columns={columns}
        dataSource={slides}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      {/* Modal Thêm Mới */}
      <Modal
        title="Thêm Banner Mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setFileList([]);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ isActive: true, order: 0 }}
        >
          <Form.Item label="Hình ảnh" required>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item name="title" label="Tiêu đề (Mô tả ảnh)">
            <Input placeholder="Nhập tiêu đề (tùy chọn)" />
          </Form.Item>

          <Flex gap={16}>
            <Form.Item name="order" label="Thứ tự hiển thị" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Trạng thái"
              valuePropName="checked"
              style={{ flex: 1 }}
            >
              <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
            </Form.Item>
          </Flex>

          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
            size="large"
          >
            Thêm mới
          </Button>
        </Form>
      </Modal>
    </Flex>
  );
}

export default SlideshowManager;
