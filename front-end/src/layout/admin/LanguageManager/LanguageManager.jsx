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
} from "antd";
import { Link } from "react-router-dom";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";

function LanguageManager() {
  const [languages, setLanguages] = useState([]);
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [filteredLanguages, setFilteredLanguages] = useState([]);
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
      title: "Mã ngôn ngữ",
      dataIndex: "languageid",
      width: 200,
    },
    {
      title: "Ngôn ngữ",
      dataIndex: "language",
    },
    {
      title: "Sửa",
      dataIndex: "_id",
      render: (_id) => (
        <Link to={`update/${_id}`}>
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
    try {
      const response = await apiClient.get(`/language`);
      const data = response.data.map((l) => ({
        key: l._id,
        _id: l._id,
        language: l.language,
        languageid: l.languageid,
      }));
      setLanguages(data);
      setFilteredLanguages(data);
    } catch (err) {
      errorMessage("Không thể tải danh sách ngôn ngữ");
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onFinish = async (values) => {
    const languageIdExists = languages.some(
      (lang) =>
        lang.languageid.trim().toLowerCase() ===
        values.languageid.trim().toLowerCase()
    );
    const languageNameExists = languages.some(
      (lang) =>
        lang.language.trim().toLowerCase() ===
        values.language.trim().toLowerCase()
    );

    if (languageIdExists) {
      errorMessage("Mã ngôn ngữ này đã tồn tại!");
      return;
    }
    if (languageNameExists) {
      errorMessage("Tên ngôn ngữ này đã tồn tại!");
      return;
    }

    setSpinning(true);
    try {
      await apiClient.post(`/language/add`, values);
      successMessage("Thêm ngôn ngữ thành công");
      setOpen(false);
      form.resetFields();
      await fetchData();
    } catch (error) {
      errorMessage(error.response?.data?.message || "Thêm ngôn ngữ thất bại");
    } finally {
      setSpinning(false);
    }
  };

  const handleDelete = async () => {
    setSpinning(true);
    try {
      await apiClient.delete(`/language/multiple`, {
        data: { languageIds: selectedRowKeys },
      });
      successMessage(`Đã xóa ${selectedRowKeys.length} ngôn ngữ`);
      setSelectedRowKeys([]);
      await fetchData();
    } catch (error) {
      errorMessage(error.response?.data?.message || "Xóa ngôn ngữ thất bại");
    } finally {
      setOpenDeleteConfirm(false);
      setSpinning(false);
    }
  };

  const handleSearch = (value) => {
    const keyword = value?.toString().toLowerCase().trim();
    if (!keyword) {
      setFilteredLanguages(languages);
      return;
    }
    const filtered = languages.filter((language) =>
      String(language.languageid || "")
        .toLowerCase()
        .includes(keyword)
    );
    setFilteredLanguages(filtered);
  };

  const searchByName = (value) => {
    const keyword = value?.toString().toLowerCase().trim();
    const result = languages.filter((t) =>
      String(t.language || "")
        .toLowerCase()
        .includes(keyword)
    );
    setFilteredLanguages(result);
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
    <Flex
      className="LanguageManager"
      vertical
      gap={20}
      style={{ position: "relative" }}
    >
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý ngôn ngữ" }]}
      />
      <Flex gap={12}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          Thêm ngôn ngữ
        </Button>
        <Input.Search
          placeholder="Tìm theo mã ngôn ngữ"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Input.Search
          placeholder="Tìm theo tên ngôn ngữ"
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
          <span>Đã chọn {selectedRowKeys.length} ngôn ngữ</span>
          <Button
            type="primary"
            danger
            onClick={() => setOpenDeleteConfirm(true)}
          >
            Xoá
          </Button>
        </Flex>
      )}

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (newKeys) => setSelectedRowKeys(newKeys),
        }}
        columns={columns}
        dataSource={filteredLanguages}
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
          Bạn có chắc muốn xóa {selectedRowKeys.length} ngôn ngữ đã chọn không?
        </p>
      </Modal>

      <Modal
        open={open}
        title="Thêm ngôn ngữ mới"
        onCancel={() => setOpen(false)}
        footer={[]}
        width={400}
        centered
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Mã ngôn ngữ"
            name="languageid"
            rules={[
              { required: true, message: "Vui lòng nhập mã ngôn ngữ!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (/\s/.test(value)) {
                    return Promise.reject("Mã không được chứa khoảng trắng!");
                  }
                  if (!/^[A-Z]{3}$/.test(value)) {
                    return Promise.reject(
                      "Mã ngôn ngữ phải gồm 3 chữ cái in hoa!"
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Ví dụ: ENG" allowClear />
          </Form.Item>
          <Form.Item
            label="Ngôn ngữ"
            name="language"
            rules={[
              { required: true, message: "Vui lòng nhập tên ngôn ngữ!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (/\d/.test(value)) {
                    return Promise.reject("Tên không được chứa số!");
                  }
                  if (/[^a-zA-ZÀ-Ỹà-ỹ\s]/.test(value)) {
                    return Promise.reject(
                      "Tên không được chứa ký tự đặc biệt!"
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Ví dụ: Tiếng Anh" allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Tạo ngôn ngữ
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}

export default LanguageManager;
