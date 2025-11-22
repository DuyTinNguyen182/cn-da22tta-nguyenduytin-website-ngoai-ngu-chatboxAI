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
} from "antd";
import { Link } from "react-router-dom";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
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

  const [spinning, setSpinning] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const { state } = useAuth();
  const { currentUser } = state;

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

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
    { title: "Mã khóa học", dataIndex: ["course_id", "courseid"] },
    { title: "Ngôn ngữ", dataIndex: ["course_id", "language_id", "language"] },
    {
      title: "Trình độ",
      dataIndex: ["course_id", "languagelevel_id", "language_level"],
    },
    { title: "Mã học viên", dataIndex: ["user_id", "userid"] },
    { title: "Tên học viên", dataIndex: ["user_id", "fullname"] },
    {
      title: "Ngày đăng ký",
      dataIndex: "enrollment_date",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày thanh toán",
      dataIndex: "paymentDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isPaid",
      render: (isPaid, record) => (
        <Tag
          color={isPaid ? "green" : "volcano"}
          style={{ cursor: isPaid ? "default" : "pointer" }}
          onClick={() => {
            if (isPaid) return;
            modal.confirm({
              title: "Xác nhận thanh toán",
              content: `Xác nhận học viên "${record.user_id?.fullname}" đã thanh toán?`,
              okText: "Xác nhận",
              cancelText: "Hủy",
              onOk: () => handleConfirmPayment(record._id),
            });
          }}
        >
          {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
        </Tag>
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
      if (coursesForModal.length === 0 || usersForModal.length === 0) {
        const [courseRes, userRes] = await Promise.all([
          apiClient.get("/course"),
          apiClient.get("/user"),
        ]);
        setCoursesForModal(courseRes.data);
        setUsersForModal(userRes.data);
      }
    } catch (error) {
      errorMessage("Không thể tải dữ liệu cho form");
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
    // console.log("Sample registration:", registrations[0]);

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
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        columns={columns}
        dataSource={filteredRegistrations}
        bordered
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
