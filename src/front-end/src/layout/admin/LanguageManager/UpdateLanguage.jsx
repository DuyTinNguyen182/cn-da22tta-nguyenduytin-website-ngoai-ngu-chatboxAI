import {
    Form,
    Input,
    Button,
    Breadcrumb,
    Flex,
    Spin,
    message,
  } from "antd";
  import apiClient from "../../../api/axiosConfig";
  import { useEffect, useState } from "react";
  import { Link, useNavigate, useParams } from "react-router-dom";
  
  function UpdateLanguage() {
    const { id } = useParams();
    const navigate = useNavigate();
  
    const [form] = Form.useForm();
    const [spinning, setSpinning] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();
    const [languageName, setLanguageName] = useState('');

    const successMessage = (content) => messageApi.success(content);
    const errorMessage = (content) => messageApi.error(content);
  
    useEffect(() => {
      const fetchLanguage = async () => {
        try {
          const res = await apiClient.get(`/language/${id}`);
          form.setFieldsValue({
            language: res.data.language,
            languageid: res.data.languageid,
          });
          setLanguageName(res.data.language);
        } catch (error) {
          errorMessage("Không thể tải dữ liệu ngôn ngữ");
        } finally {
          setSpinning(false);
        }
      };
      fetchLanguage();
    }, [id, form]);
  
    const onFinish = async (values) => {
      setSpinning(true);
      try {
        await apiClient.put(`/language/${id}`, values);
        successMessage("Cập nhật thành công");
        setTimeout(() => {
          navigate("/admin/languages");
        }, 1000);
      } catch (error) {
        errorMessage(error.response?.data?.message || "Cập nhật thất bại");
      } finally {
        setSpinning(false);
      }
    };
  
    return (
      <Flex className="UpdateLanguage" vertical gap={20}>
        {contextHolder}
        <Spin spinning={spinning} fullscreen />
        <Breadcrumb
          items={[
            { title: "Admin Dashboard" },
            { title: <Link to="/admin/languages">Quản lý ngôn ngữ</Link> },
            { title: `Cập nhật: ${languageName}` },
          ]}
        />
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 400, margin: "0 auto", width: '100%' }}
        >
          <Form.Item label="Mã ngôn ngữ (ID)" name="languageid">
            <Input disabled />
          </Form.Item>          
          <Form.Item
            label="Tên ngôn ngữ"
            name="language"
            rules={[
              { required: true, message: "Vui lòng nhập tên ngôn ngữ" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (/\d/.test(value)) 
                  {
                    return Promise.reject('Tên ngôn ngữ không được chứa ký tự số!');
                  }
                  if (/[^a-zA-ZÀ-Ỹà-ỹ\s]/.test(value))
                  {
                    return Promise.reject("Tên ngôn ngữ không được chứa ký tự đặc biệt!");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Ví dụ: Tiếng Anh" size="large" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Flex>
    );
  }
  
  export default UpdateLanguage;