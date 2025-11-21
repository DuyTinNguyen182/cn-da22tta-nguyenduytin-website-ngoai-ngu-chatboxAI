import {
  Form,
  Input,
  Button,
  Breadcrumb,
  Flex,
  Spin,
  Select,
  message,
  DatePicker,
  InputNumber,
  Upload,
  Space,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";
import { PlusOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";

function UpdateCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [languages, setLanguages] = useState([]);
  const [languageLevels, setLanguageLevels] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [fileList, setFileList] = useState([]);
  const [isImageChanged, setIsImageChanged] = useState(false);

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, langRes, levelRes, teacherRes] = await Promise.all([
          apiClient.get(`/course/${id}`),
          apiClient.get("/language"),
          apiClient.get("/languagelevel"),
          apiClient.get("/teacher"),
        ]);

        const courseData = courseRes.data;
        setLanguages(langRes.data);
        setLanguageLevels(levelRes.data);
        setTeachers(teacherRes.data);
        setCourseName(courseData.courseid);

        const languageId = courseData.language_id?._id;
        setSelectedLanguageId(languageId);

        if (courseData.image) {
          setFileList([
            {
              uid: "-1",
              name: "image.png",
              status: "done",
              url: courseData.image,
            },
          ]);
        }

        form.setFieldsValue({
          courseid: courseData.courseid,
          language_id: languageId,
          languagelevel_id: courseData.languagelevel_id?._id,
          teacher_id: courseData.teacher_id?._id,
          Start_Date: courseData.Start_Date
            ? moment(courseData.Start_Date)
            : null,
          end_date: courseData.end_date ? moment(courseData.end_date) : null,
          Number_of_periods: courseData.Number_of_periods,
          Tuition: courseData.Tuition,
          discount_percent: courseData.discount_percent,
          Description: courseData.Description,
        });
      } catch (error) {
        errorMessage("Không thể tải dữ liệu khóa học");
      } finally {
        setSpinning(false);
      }
    };
    fetchData();
  }, [id, form]);

  const onFinish = async (values) => {
  setSpinning(true);
  const formData = new FormData();

  for (const key in values) {
    if (key !== "image") {
      formData.append(key, values[key]);
    }
  }

  if (isImageChanged && fileList.length > 0 && fileList[0].originFileObj) {
    formData.append("image", fileList[0].originFileObj);
  }

  try {
    await apiClient.put(`/course/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    successMessage("Cập nhật khóa học thành công");
    setTimeout(() => navigate("/admin/courses"), 1000);
  } catch (error) {
    errorMessage(error.response?.data?.message || "Cập nhật thất bại");
  } finally {
    setSpinning(false);
  }
};


  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      setIsImageChanged(true);
    } else if (newFileList.length === 0) {
      setIsImageChanged(true);
    }
  };

  return (
    <Flex vertical gap={20}>
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[
          { title: "Admin Dashboard" },
          { title: <Link to="/admin/courses">Quản lý khóa học</Link> },
          { title: `Cập nhật: ${courseName}` },
        ]}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}
      >
        <Form.Item label="Ảnh bìa khóa học" name="image">
          <ImgCrop rotationSlider aspect={16 / 9}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleFileChange}
              maxCount={1}
            >
              {fileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div>Tải lên</div>
                </div>
              )}
            </Upload>
          </ImgCrop>
        </Form.Item>
        <Form.Item label="Mã khóa học" name="courseid">
          <Input disabled />
        </Form.Item>
        <Flex gap="middle">
          <Form.Item
            name="language_id"
            label="Ngôn ngữ"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Chọn ngôn ngữ"
              onChange={setSelectedLanguageId}
            >
              {languages.map((lang) => (
                <Select.Option key={lang._id} value={lang._id}>
                  {lang.language}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="languagelevel_id"
            label="Trình độ"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Select placeholder="Chọn trình độ">
              {languageLevels.map((lv) => (
                <Select.Option key={lv._id} value={lv._id}>
                  {lv.language_level}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Flex>
        <Form.Item
          name="teacher_id"
          label="Giảng viên"
          rules={[{ required: true }]}
        >
          <Select placeholder="Chọn giảng viên" disabled={!selectedLanguageId}>
            {teachers
              .filter(
                (teacher) => teacher.language_id?._id === selectedLanguageId
              )
              .map((teacher) => (
                <Select.Option key={teacher._id} value={teacher._id}>
                  {teacher.full_name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Flex gap="middle">
          <Form.Item
            name="Start_Date"
            label="Ngày bắt đầu"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              placeholder="Chọn ngày bắt đầu"
            />
          </Form.Item>
          <Form.Item
            name="end_date"
            label="Ngày kết thúc"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              placeholder="Chọn ngày kết thúc"
            />
          </Form.Item>
        </Flex>
        <Flex gap="middle">
          <Form.Item
            name="Number_of_periods"
            label="Số tiết"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Nhập số tiết"
            />
          </Form.Item>
          <Form.Item
            name="Tuition"
            label="Học phí (VNĐ)"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              placeholder="Nhập học phí"
            />
          </Form.Item>
          <Form.Item
            name="discount_percent"
            label="% Giảm giá"
            style={{ flex: 1 }}
          >
            <Space.Compact style={{ width: "100%" }}>
              <InputNumber min={0} max={100} style={{ width: "100%" }} />
              <Button disabled style={{ width: 80, cursor: "default" }}>
                %
              </Button>
            </Space.Compact>
          </Form.Item>
        </Flex>
        <Form.Item name="Description" label="Mô tả">
          <Input.TextArea rows={3} />
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

export default UpdateCourse;
