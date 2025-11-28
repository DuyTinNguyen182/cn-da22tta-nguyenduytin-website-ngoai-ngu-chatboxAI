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
  Select,
  Tag,
  Result,
  Tooltip,
} from "antd";
import { Link } from "react-router-dom";
import {
  PlusOutlined,
  EditOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";

function CourseRegistrationManager() {
  const [open, setOpen] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modal, contextHolderModal] = Modal.useModal();

  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);

  const [coursesForModal, setCoursesForModal] = useState([]);
  const [usersForModal, setUsersForModal] = useState([]);
  const [sessionsForModal, setSessionsForModal] = useState([]);

  const [spinning, setSpinning] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const { state } = useAuth();
  const { currentUser } = state;

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  const getClassStatusTag = (status) => {
    switch (status) {
      case "confirmed":
        return <Tag color="green">Đã mở lớp</Tag>;
      case "cancelled":
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag color="orange">Chờ xếp lớp</Tag>;
    }
  };

  const showConfirmPayment = (record) => {
    modal.confirm({
      title: "Xác nhận thanh toán",
      icon: <DollarCircleOutlined style={{ color: "#52c41a" }} />,
      content: (
        <div>
          <p>
            Xác nhận học viên <b>{record.user_id?.fullname}</b> đã đóng học phí?
          </p>
          <p>Khóa học: {record.course_id?.courseid}</p>
        </div>
      ),
      okText: "Xác nhận đã thu tiền",
      okType: "primary",
      cancelText: "Hủy bỏ",
      onOk: () => handleConfirmPayment(record._id),
    });
  };

  const handleConfirmPayment = async (registrationId) => {
    setSpinning(true);
    try {
      await apiClient.patch(`/registration/${registrationId}/confirm-payment`);
      successMessage("Xác nhận thanh toán thành công!");
      await fetchData();
    } catch (error) {
      errorMessage(error.response?.data?.message || "Xác nhận thất bại.");
    } finally {
      setSpinning(false);
    }
  };

  const columns = [
    { title: "Mã KH", dataIndex: ["course_id", "courseid"], width: 100 },
    // { title: "Ngôn ngữ", dataIndex: ["course_id", "language_id", "language"] },
    {
      title: "Tên khóa học",
      render: (_, record) =>
        `${record.course_id?.language_id?.language} - ${record.course_id?.languagelevel_id?.language_level}`,
    },
    {
      title: "Lịch học",
      width: 180,
      render: (_, record) =>
        record.class_session_id ? (
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.class_session_id.days}
            </div>
            <div style={{ color: "#666", fontSize: 12 }}>
              {record.class_session_id.time}
            </div>
          </div>
        ) : (
          <span style={{ color: "#ccc" }}>Chưa xếp lịch</span>
        ),
    },
    {
      title: "Học viên",
      render: (_, record) => (
        <div>
          <div>{record.user_id?.fullname}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {record.user_id?.userid}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "enrollment_date",
      width: 120,
      render: (date) => moment(date).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        new Date(a.enrollment_date) - new Date(b.enrollment_date),
    },
    {
      title: "Trạng thái lớp",
      dataIndex: "status",
      width: 130,
      align: "center",
      render: (status) => getClassStatusTag(status),
      filters: [
        { text: "Chờ xếp lớp", value: "pending" },
        { text: "Đã mở lớp", value: "confirmed" },
        { text: "Đã hủy", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thanh toán",
      key: "payment",
      width: 160,
      align: "center",
      render: (_, record) => {
        if (record.isPaid) {
          return (
            <div style={{ color: "#389e0d", fontWeight: 500 }}>
              {record.paymentDate
                ? moment(record.paymentDate).format("DD/MM/YYYY")
                : "Đã thanh toán"}
            </div>
          );
        } else {
          return (
            <Tooltip title="Bấm để xác nhận thu tiền">
              <Tag
                color="volcano"
                style={{ cursor: "pointer" }}
                onClick={() => showConfirmPayment(record)}
              >
                Chưa thanh toán
              </Tag>
            </Tooltip>
          );
        }
      },
      filters: [
        { text: "Đã thanh toán", value: true },
        { text: "Chưa thanh toán", value: false },
      ],
      onFilter: (value, record) => record.isPaid === value,
    },
    {
      title: "Sửa",
      dataIndex: "_id",
      render: (id) => (
        <Link to={`update/${id}`}>
          <Button type="text" icon={<EditOutlined />} />
        </Link>
      ),
      width: 60,
      align: "center",
    },
  ];

  const fetchData = async () => {
    setSpinning(true);
    try {
      const regRes = await apiClient.get("/registration");
      const registrationsWithKey = regRes.data.map((reg) => ({
        ...reg,
        key: reg._id,
      }));
      setRegistrations(registrationsWithKey);
      setFilteredRegistrations(registrationsWithKey);
    } catch (error) {
      errorMessage("Không thể tải dữ liệu đăng ký");
    } finally {
      setSpinning(false);
    }
  };

  const fetchModalData = async () => {
    try {
      setSpinning(true);
      const [courseRes, userRes, sessionRes] = await Promise.all([
        apiClient.get("/course"),
        apiClient.get("/user"),
        apiClient.get("/class-sessions"),
      ]);

      setCoursesForModal(courseRes.data);
      setUsersForModal(userRes.data);
      setSessionsForModal(sessionRes.data);
    } catch (error) {
      errorMessage("Không thể tải dữ liệu cho form");
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
      await apiClient.delete("/registration/multiple", {
        data: { registrationIds: selectedRowKeys },
      });
      successMessage(`Đã xóa ${selectedRowKeys.length} đăng ký`);
      setSelectedRowKeys([]);
      await fetchData();
    } catch (err) {
      errorMessage("Lỗi khi xoá các đăng ký!");
    } finally {
      setOpenDeleteConfirm(false);
      setSpinning(false);
    }
  };

  const onFinish = async (values) => {
    setSpinning(true);
    try {
      await apiClient.post(`/registration`, values);
      successMessage("Tạo đăng ký thành công!");
      setOpen(false);
      form.resetFields();
      await fetchData();
    } catch (err) {
      errorMessage(err.response?.data?.message || "Tạo đăng ký thất bại!");
    } finally {
      setSpinning(false);
    }
  };

  const handleSearch = (value) => {
    const keyword = value?.toString().trim();
    if (!keyword) {
      setFilteredRegistrations(registrations);
      return;
    }
    const filtered = registrations.filter((reg) =>
      String(reg.user_id?.userid || "").includes(keyword)
    );
    setFilteredRegistrations(filtered);
  };

  const searchByName = (value) => {
    const keyword = value.trim().toLowerCase();
    const filtered = registrations.filter((reg) =>
      String(reg.user_id?.fullname || "")
        .toLowerCase()
        .includes(keyword)
    );
    setFilteredRegistrations(filtered);
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
    <Flex className="CourseRegistrationManager" vertical gap={20}>
      {contextHolder}
      {contextHolderModal}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý đăng ký" }]}
      />
      <Flex gap={12}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setOpen(true);
            fetchModalData();
          }}
        >
          Thêm đăng ký
        </Button>
        <Input.Search
          placeholder="Tìm theo mã học viên"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Input.Search
          placeholder="Tìm theo tên học viên"
          onSearch={searchByName}
          onChange={(e) => searchByName(e.target.value)}
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
          <span>Đã chọn {selectedRowKeys.length} đơn đăng ký</span>
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
        dataSource={filteredRegistrations}
        bordered
        scroll={{ x: 1300 }}
      />

      <Modal
        open={openDeleteConfirm}
        title="Xác nhận xoá"
        onOk={() => setOpenDeleteConfirm(false)}
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
          Bạn có chắc chắn muốn xóa {selectedRowKeys.length} đăng ký đã chọn
          không?
        </p>
      </Modal>
      <Modal
        open={open}
        title="Thêm đăng ký mới"
        onCancel={() => setOpen(false)}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="user_id"
            label="Học viên"
            rules={[{ required: true, message: "Vui lòng chọn học viên!" }]}
          >
            <Select
              showSearch
              placeholder="Tìm và chọn học viên"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={usersForModal.map((u) => ({
                value: u._id,
                label: `${u.userid} - ${u.fullname}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="course_id"
            label="Khóa học"
            rules={[{ required: true, message: "Vui lòng chọn khóa học!" }]}
          >
            <Select
              showSearch
              placeholder="Tìm và chọn khóa học"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={coursesForModal.map((c) => ({
                value: c._id,
                label: `${c.courseid} - ${c.language_id?.language} - ${c.languagelevel_id?.language_level}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="class_session_id"
            label="Lịch học (Buổi học)"
            rules={[{ required: true, message: "Vui lòng chọn lịch học!" }]}
          >
            <Select
              placeholder="Chọn ca học / buổi học"
              options={sessionsForModal.map((s) => ({
                value: s._id,
                label: `${s.days} - ${s.time}`,
              }))}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Xác nhận đăng ký
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}

export default CourseRegistrationManager;
