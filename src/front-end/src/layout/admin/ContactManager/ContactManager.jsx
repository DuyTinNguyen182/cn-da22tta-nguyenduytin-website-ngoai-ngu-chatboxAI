import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Flex,
  Breadcrumb,
  Modal,
  Input,
  Spin,
  message,
  Result,
  Tag,
  Tooltip,
  Popconfirm,
  Space,
  Typography,
} from "antd";
import { Link } from "react-router-dom";
import {
  DeleteOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";

const { Text } = Typography;

function ContactManager() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [spinning, setSpinning] = useState(true);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const { state } = useAuth();
  const { currentUser } = state;

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  const getStatusTag = (status) => {
    switch (status) {
      case "pending":
        return <Tag color="volcano">Chưa xử lý</Tag>;
      case "processed":
        return <Tag color="success">Đã xử lý</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Họ và Tên",
      dataIndex: "fullname",
      width: 180,
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
    },

    {
      title: "Email",
      dataIndex: "email",
      width: 230,
      render: (email) => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <a href={`mailto:${email}`} style={{ marginRight: 8 }}>
            {email}
          </a>
          <Text
            copyable={{ text: email, tooltips: ["Sao chép", "Đã chép!"] }}
          />
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      width: 160,
      render: (phone) =>
        phone ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{phone}</span>
            <Text
              copyable={{ text: phone, tooltips: ["Sao chép", "Đã chép!"] }}
            />
          </div>
        ) : (
          <span style={{ color: "#ccc" }}>--</span>
        ),
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              maxWidth: 300,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      width: 150,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: getStatusTag,
      filters: [
        { text: "Chưa xử lý", value: "pending" },
        { text: "Đã xử lý", value: "processed" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hành động",
      key: "action",
      width: 130,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          {record.status === "pending" && (
            <Tooltip title="Đánh dấu đã xử lý">
              <Button
                type="text"
                icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                onClick={() => handleMarkProcessed(record._id)}
              />
            </Tooltip>
          )}

          <Popconfirm
            title="Xóa liên hệ?"
            description="Bạn có chắc chắn muốn xóa tin nhắn này không?"
            onConfirm={() => handleDeleteSingle(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchData = async () => {
    setSpinning(true);
    try {
      const res = await apiClient.get("/contacts");
      const contactsWithKey = res.data.map((c) => ({ ...c, key: c._id }));
      setContacts(contactsWithKey);
      setFilteredContacts(contactsWithKey);
    } catch (err) {
      errorMessage("Không thể tải danh sách liên hệ");
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteMultiple = async () => {
    setSpinning(true);
    try {
      await Promise.all(
        selectedRowKeys.map((id) => apiClient.delete(`/contacts/${id}`))
      );

      successMessage(`Đã xóa ${selectedRowKeys.length} liên hệ`);
      setSelectedRowKeys([]);
      await fetchData();
    } catch (err) {
      errorMessage("Xóa liên hệ thất bại");
    } finally {
      setOpenDeleteConfirm(false);
      setSpinning(false);
    }
  };

  const handleDeleteSingle = async (id) => {
    try {
      await apiClient.delete(`/contacts/${id}`);
      successMessage("Đã xóa liên hệ.");
      fetchData();
    } catch (error) {
      errorMessage("Xóa thất bại.");
    }
  };

  const handleMarkProcessed = async (id) => {
    setSpinning(true);
    try {
      await apiClient.patch(`/contacts/${id}`, { status: "processed" });
      successMessage("Đã cập nhật trạng thái.");

      const updatedList = contacts.map((c) =>
        c._id === id ? { ...c, status: "processed" } : c
      );
      setContacts(updatedList);
      setFilteredContacts(updatedList);
    } catch (error) {
      errorMessage("Cập nhật thất bại.");
    } finally {
      setSpinning(false);
    }
  };

  const handleSearch = (value) => {
    const keyword = value?.toString().toLowerCase().trim();
    if (!keyword) {
      setFilteredContacts(contacts);
      return;
    }
    const filtered = contacts.filter(
      (c) =>
        c.fullname.toLowerCase().includes(keyword) ||
        c.email.toLowerCase().includes(keyword)
    );
    setFilteredContacts(filtered);
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
    <Flex vertical gap={20} style={{ padding: "20px" }}>
      {contextHolder}
      <Spin spinning={spinning} fullscreen />

      <Breadcrumb
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý liên hệ" }]}
      />

      <Flex gap={12} justify="space-between">
        <Space>
          <Input.Search
            placeholder="Tìm theo tên hoặc email"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
            enterButton={<SearchOutlined />}
          />
          {/* <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Làm mới
          </Button> */}
        </Space>
      </Flex>

      {selectedRowKeys.length > 0 && (
        <Flex
          align="center"
          justify="space-between"
          style={{
            padding: "10px 15px",
            borderRadius: "5px",
            backgroundColor: "#fff",
            border: "1px solid #d9d9d9",
            marginBottom: 10,
          }}
        >
          <span>Đã chọn {selectedRowKeys.length} liên hệ</span>
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
        dataSource={filteredContacts}
        bordered
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={openDeleteConfirm}
        title="Xác nhận xoá"
        onCancel={() => setOpenDeleteConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setOpenDeleteConfirm(false)}>
            Quay lại
          </Button>,
          <Button
            key="submit"
            danger
            type="primary"
            onClick={handleDeleteMultiple}
          >
            Xoá
          </Button>,
        ]}
        centered
      >
        <p>
          Bạn có chắc muốn xóa vĩnh viễn {selectedRowKeys.length} liên hệ đã
          chọn không?
        </p>
      </Modal>
    </Flex>
  );
}

export default ContactManager;
