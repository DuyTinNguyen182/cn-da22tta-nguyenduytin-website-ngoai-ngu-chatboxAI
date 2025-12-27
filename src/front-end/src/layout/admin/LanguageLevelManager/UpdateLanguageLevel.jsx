import {
  Form,
  Input,
  Button,
  Breadcrumb,
  Flex,
  Spin,
  message,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/axiosConfig";

function UpdateLanguageLevel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [levelName, setLevelName] = useState("");
  const [languages, setLanguages] = useState([]);

  const [allLevels, setAllLevels] = useState([]);

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  useEffect(() => {
    const fetchData = async () => {
      setSpinning(true);
      try {
        const [levelRes, langRes, allLevelsRes] = await Promise.all([
          apiClient.get(`/languagelevel/${id}`),
          apiClient.get(`/language`),
          apiClient.get(`/languagelevel`),
        ]);

        setLanguages(langRes.data);
        setAllLevels(allLevelsRes.data);

        form.setFieldsValue({
          language_level: levelRes.data.language_level,
          language_levelid: levelRes.data.language_levelid,
          language_id:
            levelRes.data.language_id?._id || levelRes.data.language_id,
        });
        setLevelName(levelRes.data.language_level);
      } catch (error) {
        errorMessage("Không thể tải dữ liệu trình độ");
      } finally {
        setSpinning(false);
      }
    };
    fetchData();
  }, [id, form]);

  const onFinish = async (values) => {
    const isDuplicateId = allLevels.some((level) => {
      if (level._id === id) return false;
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
      await apiClient.put(`/languagelevel/${id}`, values);
      successMessage("Cập nhật trình độ thành công");
      setTimeout(() => navigate("/admin/languageslevel"), 1000);
    } catch (error) {
      errorMessage(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSpinning(false);
    }
  };

  return (
    <Flex className="UpdateLanguageLevel" vertical gap={20}>
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[
          { title: "Admin Dashboard" },
          { title: <Link to="/admin/languageslevel">Quản lý trình độ</Link> },
          { title: `Cập nhật: ${levelName}` },
        ]}
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 400, margin: "0 auto", width: "100%" }}
      >
        <Form.Item label="Mã trình độ (ID)" name="language_levelid">
          <Input disabled />
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
          rules={[{ required: true, message: "Vui lòng nhập tên trình độ" }]}
        >
          <Input placeholder="Ví dụ: Trình độ A1" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
    </Flex>
  );
}

export default UpdateLanguageLevel;
