import {
  HomeOutlined,
  MailOutlined,
  UserOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Spin, message, Select, Upload } from "antd";
import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import ImgCrop from "antd-img-crop";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";

function UserAcc() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState([]);
  const [spinning, setSpinning] = useState(true);
  const [isAvatarChanged, setIsAvatarChanged] = useState(false);
  const [genderEdited, setGenderEdited] = useState(false);

  const { state, dispatch } = useAuth();
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
      ...(!genderEdited && { gender: values.gender }),
    };

    try {
      const response = await apiClient.put(`/user/${userId}`, updatedUserData);
      const updatedUserFromDB = response.data;
      dispatch({ type: "UPDATE_USER_SUCCESS", payload: updatedUserFromDB });
      successMessage();
    } catch (error) {
      errorMessage(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSpinning(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      setIsAvatarChanged(true);
    } else {
      setIsAvatarChanged(false);
    }
  };

  const customRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F4F7] px-4 flex justify-center items-start mt-4 pt-12 md:pt-0 md:pb-5">
      {contextHolder}
      <Spin spinning={spinning} fullscreen />

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg mt-0">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý thông tin tài khoản
          </p>
        </div>

        <Form
          form={form}
          name="update_user"
          layout="vertical"
          onFinish={onFinish}
          className="flex flex-col gap-2"
        >
          <div className="flex justify-center mb-3">
            <Form.Item name="avatar" valuePropName="fileList" noStyle>
              <div className="flex flex-col items-center gap-3">
                <ImgCrop
                  aspect={1}
                  showGrid
                  rotationSlider
                  quality={0.9}
                  modalTitle="Chỉnh sửa ảnh đại diện"
                >
                  <Upload
                    listType="picture-circle"
                    fileList={fileList}
                    onChange={handleFileChange}
                    maxCount={1}
                    customRequest={customRequest}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {fileList.length < 1 && (
                      <div className="flex flex-col items-center justify-center text-gray-400 text-xs">
                        <span>+ Tải ảnh</span>
                      </div>
                    )}
                  </Upload>
                </ImgCrop>
                <span className="text-xs text-gray-400">
                  Nhấn vào ảnh để thay đổi
                </span>
              </div>
            </Form.Item>
          </div>

          <Form.Item
            name="name"
            label={
              <span className="font-semibold text-gray-700">Họ và tên</span>
            }
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Nhập họ và tên của bạn"
              size="large"
              className="rounded-lg py-2.5"
            />
          </Form.Item>

          <div className="">
            <Form.Item
              name="gender"
              label={
                <span className="font-semibold text-gray-700">Giới tính</span>
              }
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
              className="mb-0"
            >
              {genderEdited ? (
                <Input
                  disabled
                  size="large"
                  className="rounded-lg bg-gray-50 text-gray-500"
                />
              ) : (
                <Select
                  placeholder="Chọn giới tính"
                  size="large"
                  className="h-[42px]"
                >
                  <Select.Option value="Nam">
                    <ManOutlined className="mr-2 text-blue-500" /> Nam
                  </Select.Option>
                  <Select.Option value="Nữ">
                    <WomanOutlined className="mr-2 text-pink-500" /> Nữ
                  </Select.Option>
                </Select>
              )}
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="font-semibold text-gray-700">Email</span>}
              rules={[
                { required: true, message: "Vui lòng nhập Email!" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
              className="mb-0"
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Email"
                size="large"
                className="rounded-lg py-2.5"
                disabled
              />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label={<span className="font-semibold text-gray-700">Địa chỉ</span>}
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            className="mt-4"
          >
            <Input
              prefix={<HomeOutlined className="text-gray-400" />}
              placeholder="Nhập địa chỉ liên hệ"
              size="large"
              className="rounded-lg py-2.5"
            />
          </Form.Item>

          <Form.Item className="mt-4 mb-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full h-12 bg-blue-600 hover:!bg-blue-500 font-bold text-lg rounded-xl shadow-md shadow-blue-200 transition-transform active:scale-95"
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default UserAcc;
