import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Upload,
  Switch,
  InputNumber,
  Breadcrumb,
  Flex,
  message,
  Spin,
  Image,
} from "antd";
import { PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import apiClient from "../../../api/axiosConfig";

function UpdateSlideshow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [currentImage, setCurrentImage] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchSlide = async () => {
      try {
        const res = await apiClient.get(`/slideshow/${id}`);
        const data = res.data;

        form.setFieldsValue({
          title: data.title,
          order: data.order,
          isActive: data.isActive,
        });

        setCurrentImage(data.image);
        setLoading(false);
      } catch (error) {
        messageApi.error("Không tìm thấy banner");
        navigate("/admin/slideshow");
      }
    };
    fetchSlide();
  }, [id, form, navigate]);

  const onFinish = async (values) => {
    setSubmitting(true);
    const formData = new FormData();

    formData.append("title", values.title || "");
    formData.append("order", values.order);
    formData.append("isActive", values.isActive);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    }

    try {
      await apiClient.put(`/slideshow/${id}`, formData);

      messageApi.success("Cập nhật thành công!");
      setTimeout(() => navigate("/admin/slideshow"), 1000);
    } catch (error) {
      console.error(error);
      messageApi.error("Lỗi khi cập nhật");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  if (loading) return <Spin fullscreen />;

  return (
    <Flex vertical gap={20}>
      {contextHolder}
      <Breadcrumb
        items={[
          { title: "Admin Dashboard" },
          { title: <Link to="/admin/slideshow">Slideshow</Link> },
          { title: "Cập nhật Banner" },
        ]}
      />

      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          width: "100%",
          background: "#fff",
          padding: 24,
          borderRadius: 8,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/slideshow")}
          style={{ marginBottom: 20 }}
        >
          Quay lại
        </Button>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Hình ảnh hiện tại">
            {fileList.length === 0 && (
              <div style={{ marginBottom: 10 }}>
                <Image
                  src={currentImage}
                  height={150}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
              </div>
            )}

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
                  <div style={{ marginTop: 8 }}>Thay ảnh mới</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item name="title" label="Tiêu đề">
            <Input />
          </Form.Item>

          <Flex gap={16}>
            <Form.Item name="order" label="Thứ tự" style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} />
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
            loading={submitting}
            block
            size="large"
          >
            Lưu thay đổi
          </Button>
        </Form>
      </div>
    </Flex>
  );
}

export default UpdateSlideshow;
