import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Card,
  Breadcrumb,
  Flex,
  message,
  Popconfirm,
  Spin,
  Space,
  Typography,
  Modal,
  Avatar,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";

const { Text, Title } = Typography;

function AdminClassManager() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudents, setCurrentStudents] = useState([]);
  const [currentClassInfo, setCurrentClassInfo] = useState("");

  const { state } = useAuth();
  const { currentUser } = state;
  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/classes/stats");
      const formattedData = res.data.map((item, index) => ({
        ...item,
        key: `${item.course_id}_${item.class_session_id}_${item.status}`,
      }));
      setData(formattedData);
    } catch (err) {
      messageApi.error("Không thể tải dữ liệu lớp học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDecision = async (record, action) => {
    try {
      await apiClient.post("/admin/classes/decision", {
        course_id: record.course_id,
        class_session_id: record.class_session_id,
        current_status: record.status,
        action: action,
      });

      messageApi.success(
        action === "open" ? "Đã mở lớp thành công!" : "Đã hủy lớp!"
      );
      fetchData();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleViewStudents = (record) => {
    setCurrentStudents(record.students_list || []);
    setCurrentClassInfo(`${record.course_name} - ${record.days}`);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "Khóa học",
      dataIndex: "course_name",
      key: "course",
      render: (text, record) => (
        <div>
          <Title level={5} style={{ margin: 0, color: "#1890ff" }}>
            {text}
          </Title>
        </div>
      ),
    },
    {
      title: "Ngày BĐ",
      dataIndex: "Start_Date",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Lịch học",
      key: "schedule",
      render: (_, record) => (
        <div>
          <div>
            <strong>{record.days}</strong>
          </div>
          <div style={{ color: "#555" }}>
            <ClockCircleOutlined /> {record.time}
          </div>
        </div>
      ),
    },
    {
      title: "Sĩ số hiện tại",
      dataIndex: "student_count",
      key: "count",
      align: "center",
      render: (count) => (
        <div style={{ fontSize: "16px", fontWeight: "bold" }}>
          <TeamOutlined style={{ marginRight: 5, color: "#52c41a" }} />
          {count} học viên
        </div>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        let color = "default";
        let text = "Không rõ";
        if (status === "pending") {
          color = "volcano";
          text = "Đang gom (Chờ xử lý)";
        }
        if (status === "confirmed") {
          color = "success";
          text = "Đã mở lớp";
        }
        if (status === "cancelled") {
          color = "default";
          text = "Đã hủy";
        }
        return (
          <Tag color={color} style={{ fontSize: "13px", padding: "4px 8px" }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewStudents(record)}
          >
            Xem DS
          </Button>
          {record.status === "pending" ? (
            <>
              <Popconfirm
                title="Mở lớp này?"
                description="Trạng thái các học viên sẽ chuyển thành 'Đã xếp lớp'."
                onConfirm={() => handleDecision(record, "open")}
                okText="Mở lớp"
                cancelText="Đóng"
              >
                <Button type="primary" icon={<CheckCircleOutlined />}>
                  Mở lớp
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Hủy lớp này?"
                description="Các đơn đăng ký sẽ bị hủy. Hãy cân nhắc!"
                onConfirm={() => handleDecision(record, "cancel")}
                okText="Hủy lớp"
                cancelText="Đóng"
              >
                <Button danger icon={<CloseCircleOutlined />}>
                  Hủy
                </Button>
              </Popconfirm>
            </>
          ) : (
            <Text disabled>Đã xử lý</Text>
          )}
        </Space>
      ),
    },
  ];

  const studentColumns = [
    {
      title: "Họ tên",
      dataIndex: "fullname",
      render: (text) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: "#87d068" }}
          />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Mã HV",
      dataIndex: "userid",
      width: 100,
    },
    {
      title: "Email",
      render: (_, r) => (
        <div>
          <div>{r.email}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{r.phone}</div>
        </div>
      ),
    },
    {
      title: "Ngày ĐK",
      dataIndex: "registration_date",
      width: 100,
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Học phí",
      dataIndex: "isPaid",
      align: "center",
      width: 100,
      render: (isPaid) =>
        isPaid ? (
          <Tag color="green">Đã đóng</Tag>
        ) : (
          <Tag color="orange">Chưa đóng</Tag>
        ),
    },
  ];

  if (!currentUser || currentUser.role !== "Admin") {
    return <div>Không có quyền truy cập.</div>;
  }

  return (
    <Flex vertical gap={20} style={{ padding: 20 }}>
      {contextHolder}
      <Breadcrumb
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý Lớp học" }]}
      />

      <Card
        title="Thống kê & Xếp lớp"
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Làm mới
          </Button>
        }
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title={
          <div style={{ fontSize: 16 }}>
            Danh sách lớp:{" "}
            <span style={{ color: "#1890ff" }}>{currentClassInfo}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
        centered
      >
        <Table
          dataSource={currentStudents}
          columns={studentColumns}
          pagination={false}
          rowKey="userid"
          size="small"
          bordered
          scroll={{ y: 400 }}
        />
        <div style={{ marginTop: 10, textAlign: "right", color: "#666" }}>
          Tổng số: <strong>{currentStudents.length}</strong> học viên
        </div>
      </Modal>
    </Flex>
  );
}

export default AdminClassManager;
