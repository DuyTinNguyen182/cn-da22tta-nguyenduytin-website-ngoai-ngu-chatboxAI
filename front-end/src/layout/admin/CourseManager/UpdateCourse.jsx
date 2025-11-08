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
} from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";

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

        form.setFieldsValue({
          courseid: courseData.courseid,
          language_id: languageId,
          languagelevel_id: courseData.languagelevel_id?._id,
          teacher_id: courseData.teacher_id?._id,
          Start_Date: courseData.Start_Date
            ? moment(courseData.Start_Date)
            : null,
          Number_of_periods: courseData.Number_of_periods,
          Tuition: courseData.Tuition,
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
    try {
      const formattedValues = {
        ...values,
        Start_Date: moment(values.Start_Date).toISOString(),
      };
      await apiClient.put(`/course/${id}`, formattedValues);
      successMessage("Cập nhật khóa học thành công");
      setTimeout(() => navigate("/admin/courses"), 1000);
    } catch (error) {
      errorMessage(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSpinning(false);
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
        style={{ maxWidth: 500, margin: "0 auto", width: "100%" }}
      >
        <Form.Item label="Mã khóa học" name="courseid">
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="language_id"
          label="Ngôn ngữ"
          rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ!" }]}
        >
          <Select placeholder="Chọn ngôn ngữ" onChange={setSelectedLanguageId}>
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
          rules={[{ required: true, message: "Vui lòng chọn trình độ!" }]}
        >
          <Select placeholder="Chọn trình độ">
            {languageLevels.map((lv) => (
              <Select.Option key={lv._id} value={lv._id}>
                {lv.language_level}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="teacher_id"
          label="Giảng viên"
          rules={[{ required: true, message: "Vui lòng chọn giảng viên!" }]}
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
        <Form.Item
          name="Start_Date"
          label="Ngày bắt đầu"
          rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
        >
          <DatePicker
            format="DD/MM/YYYY"
            style={{ width: "100%" }}
            disabledDate={(current) =>
              current && current < moment().startOf("day")
            }
          />
        </Form.Item>
        <Form.Item
          name="Number_of_periods"
          label="Số tiết"
          rules={[{ required: true, message: "Vui lòng nhập số tiết!" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="Tuition"
          label="Học phí (VNĐ)"
          rules={[{ required: true, message: "Vui lòng nhập học phí!" }]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>
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
