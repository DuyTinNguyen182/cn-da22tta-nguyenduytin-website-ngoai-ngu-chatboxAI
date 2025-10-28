import { HomeOutlined, MailOutlined, SmileOutlined } from "@ant-design/icons";
import {
  Button,
  Flex,
  Form,
  Input,
  Spin,
  message,
  Select,
  Upload,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import ImgCrop from "antd-img-crop";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";

const { Title } = Typography;

function UserAcc() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState([]);
  const [spinning, setSpinning] = useState(true);
  const [isAvatarChanged, setIsAvatarChanged] = useState(false);
  const [genderEdited, setGenderEdited] = useState(false);

  const { state } = useAuth();
  const { currentUser } = state;
  const userId = currentUser?._id;

  const successMessage = (content = "Cập nhật thành công") => {
    messageApi.success(content);
  };

  const errorMessage = (content = "Cập nhật thất bại") => {
    messageApi.error(content);
  };

  const fetchUserData = async (uid) => {
    if (!uid) {
      setSpinning(false);
      return;
    }
    try {
      const response = await apiClient.get(`/user/${uid}`);
      const user = response.data;

      // Set giá trị cho Form
      form.setFieldsValue({
        name: user.fullname,
        email: user.email,
        username: user.username,
        gender: user.gender,
        address: user.address,
      });

      setGenderEdited(!!user.genderEdited);
      if (user.avatar) {
        setFileList([
          {
            uid: "-1",
            name: "avatar.png",
            status: "done",
            url: user.avatar,
          },
        ]);
      }
    } catch (error) {
      errorMessage("Không thể tải dữ liệu người dùng");
    } finally {
      setSpinning(false);
    }
  };

  // Effect để tải dữ liệu khi component được mount hoặc userId thay đổi
  useEffect(() => {
    setSpinning(true);
    if (userId) {
      fetchUserData(userId);
    } else {
      setSpinning(false);
    }
  }, [userId, form]);

  const onFinish = async (values) => {
    setSpinning(true);
    let avatarUrl = currentUser.avatar;

    if (isAvatarChanged && fileList.length > 0 && fileList[0].originFileObj) {
      const file = fileList[0].originFileObj;
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        const formData = new FormData();
        formData.append("avatar", compressedFile);

        const uploadRes = await apiClient.post("/upload/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        avatarUrl = uploadRes.data.url;
      } catch (error) {
        errorMessage("Lỗi khi tải ảnh lên");
        setSpinning(false);
        return;
      }
    }

    const updatedUserData = {
      fullname: values.name,
      email: values.email,
      address: values.address,
      avatar: avatarUrl,
      ...(!genderEdited && { gender: values.gender }), // Chỉ gửi gender nếu chưa bị sửa
    };

    try {
      await apiClient.put(`/user/${userId}`, updatedUserData);
      successMessage();
    } catch (error) {
      errorMessage(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSpinning(false);
    }
  };

  // Hàm xử lý thay đổi file upload
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      setIsAvatarChanged(true);
    } else {
      setIsAvatarChanged(false);
    }
  };

  if (spinning && !form.getFieldValue("name")) {
    return <Spin spinning={true} fullscreen />;
  }

  return (
    <Flex className="UpdateUser" vertical gap={20}>
      {contextHolder}
      <Spin spinning={spinning} fullscreen />

      <Form
        form={form}
        name="update_user"
        layout="vertical"
        style={{ maxWidth: "500px", margin: "0 auto", width: "100%" }}
        onFinish={onFinish}
      >
        <div style={{ textAlign: "center", marginBottom: "20px", fontWeight: 500, fontSize: 24 }}>
          Thông tin tài khoản
        </div>

        <Form.Item style={{ display: "flex", justifyContent: "center" }}>
          <ImgCrop aspect={1} showGrid rotationSlider quality={0.9}>
            <Upload
              listType="picture-circle"
              fileList={fileList}
              onChange={handleFileChange}
              maxCount={1}
            >
              {fileList.length < 1 && "+ Tải lên"}
            </Upload>
          </ImgCrop>
        </Form.Item>

        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input
            prefix={<SmileOutlined />}
            placeholder="Nhập họ và tên"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          {genderEdited ? (
            <Input disabled size="large" />
          ) : (
            <Select placeholder="Chọn giới tính" size="large">
              <Select.Option value="Nam">Nam</Select.Option>
              <Select.Option value="Nữ">Nữ</Select.Option>
            </Select>
          )}
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập Email!" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input prefix={<HomeOutlined />} placeholder="Địa chỉ" size="large" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ width: "100%" }}
          >
            Cập nhật thông tin
          </Button>
        </Form.Item>
      </Form>
    </Flex>
  );
}

export default UserAcc;
