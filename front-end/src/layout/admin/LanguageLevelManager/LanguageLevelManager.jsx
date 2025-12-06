import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Flex,
  Breadcrumb,
  Modal,
  Form,
  Input,
  Spin,
  message,
  Result,
  Select,
} from "antd";
import { Link } from "react-router-dom";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";

function LanguageLevelManager() {
  const [levels, setLevels] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [form] = Form.useForm();

  const { state } = useAuth();
  const { currentUser } = state;

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  const columns = [
    {
      title: "Mã trình độ",
      dataIndex: "language_levelid",
      width: 200,
    },
    {
      title: "Trình độ",
      dataIndex: "language_level",
    },
    {
      title: "Thuộc ngôn ngữ",
      dataIndex: ["language_id", "language"],
      render: (text) =>
        text || <span style={{ color: "orange" }}>Chưa cập nhật</span>,
    },
    {
      title: "Sửa",
      dataIndex: "_id",
      render: (_id) => (
        <Link to={`update/${_id}`}>
          <EditOutlined style={{ fontSize: "18px", color: "#1890ff" }} />
        </Link>
      ),
      width: 60,
      align: "center",
    },
  ];

  const fetchData = async () => {
    try {
      const [levelRes, langRes] = await Promise.all([
        apiClient.get(`/languagelevel`),
        apiClient.get(`/language`),
      ]);

      const data = levelRes.data.map((l) => ({
        key: l._id,
        _id: l._id,
        language_level: l.language_level,
        language_levelid: l.language_levelid,
        language_id: l.language_id,
      }));

      setLevels(data);
      setFilteredLevels(data);
      setLanguages(langRes.data);
    } catch (err) {
      errorMessage("Không thể tải dữ liệu");
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onFinish = async (values) => {
    const isDuplicateId = levels.some((level) => {
      const currentLevelLangId = level.language_id?._id || level.language_id;

      return (
        level.language_levelid.trim().toLowerCase() ===
          values.language_levelid.trim().toLowerCase() &&
        currentLevelLangId === values.language_id
      );
    });

    if (isDuplicateId) {
      errorMessage("Mã trình độ này đã tồn tại trong ngôn ngữ đã chọn!");
      return;
    }
    setSpinning(true);
    try {
      await apiClient.post(`/languagelevel/add`, values);
      successMessage("Thêm trình độ mới thành công");
      setOpen(false);
      form.resetFields();
      await fetchData();
    } catch (error) {
      errorMessage(error.response?.data?.message || "Thêm trình độ thất bại");
    } finally {
      setSpinning(false);
    }
  };

  const handleDelete = async () => {
    setSpinning(true);
    try {
      await apiClient.delete(`/languagelevel/multiple`, {
        data: { languagelevelIds: selectedRowKeys },
      });
      successMessage(`Đã xóa ${selectedRowKeys.length} trình độ`);
      setSelectedRowKeys([]);
      await fetchData();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const msg =
          //   error.response.data.message ||
          "Không thể xóa. Có khóa học đang sử dụng trình độ này.";
        errorMessage(msg);
      } else {
        errorMessage("Có lỗi xảy ra khi xoá trình độ!");
      }
    } finally {
      setOpenDeleteConfirm(false);
      setSpinning(false);
    }
  };

  const searchByName = (value) => {
    const keyword = value?.toString().toLowerCase().trim();
    if (!keyword) {
      setFilteredLevels(levels);
      return;
    }
    const result = levels.filter((t) =>
      String(t.language_level || "")
        .toLowerCase()
        .includes(keyword)
    );
    setFilteredLevels(result);
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
    <Flex className="LanguageLevelManager" vertical gap={20}>
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý trình độ" }]}
      />
      <Flex gap={12}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          Thêm trình độ
        </Button>
        <Input.Search
          placeholder="Tìm theo tên trình độ"
          onSearch={searchByName}
          onChange={(e) => searchByName(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
      </Flex>

      {selectedRowKeys.length > 0 && (
        <Flex align="center" justify="space-between" className="selection-bar">
          <span>Đã chọn {selectedRowKeys.length} trình độ</span>
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
        dataSource={filteredLevels}
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
          Bạn có chắc muốn xóa {selectedRowKeys.length} trình độ đã chọn không?
        </p>
      </Modal>

      <Modal
        open={open}
        title="Thêm trình độ mới"
        onCancel={() => setOpen(false)}
        footer={null}
        centered
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Mã trình độ"
            name="language_levelid"
            rules={[
              { required: true, message: "Vui lòng nhập mã trình độ!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (/[^A-Z0-9]/.test(value)) {
                    return Promise.reject("Chỉ cho phép chữ in hoa và số!");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Ví dụ: A1, B2, N5" allowClear />
          </Form.Item>
          <Form.Item
            label="Thuộc ngôn ngữ"
            name="language_id"
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
          <Form.Item
            label="Tên trình độ"
            name="language_level"
            rules={[{ required: true, message: "Vui lòng nhập tên trình độ!" }]}
          >
            <Input placeholder="Ví dụ: Trình độ A1" allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Tạo trình độ
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}

export default LanguageLevelManager;
