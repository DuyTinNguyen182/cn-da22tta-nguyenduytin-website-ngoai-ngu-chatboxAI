import React, { useState } from "react";
import { Modal, Form, Input, Rate, Button } from "antd";

const ReviewForm = ({ open, onCreate, onCancel, loading }) => {
  const [form] = Form.useForm();

  const [starValue, setStarValue] = useState(5);

  const ratingConfig = {
    1: { label: "Rất tệ", color: "text-red-500" },
    2: { label: "Tệ", color: "text-orange-500" },
    3: { label: "Bình thường", color: "text-yellow-500" },
    4: { label: "Tốt", color: "text-blue-500" },
    5: { label: "Tuyệt vời", color: "text-green-500" },
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        setStarValue(5);
        onCreate(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setStarValue(5);
    onCancel();
  };

  return (
    <Modal
      open={open}
      title={
        <div className="text-center border-b border-gray-100 pb-3 mb-4">
          <span className="text-xl font-bold text-gray-800">
            Đánh giá khóa học
          </span>
          <p className="text-xs text-gray-400 font-normal mt-1">
            Ý kiến của bạn giúp chúng tôi cải thiện chất lượng
          </p>
        </div>
      }
      centered
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
      width={500}
      footer={[
        <Button
          key="back"
          onClick={handleCancel}
          className="hover:bg-gray-100 border-gray-300 text-gray-600"
        >
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleOk}
          className="bg-blue-600 hover:!bg-blue-500 font-semibold shadow-md border-none"
        >
          Gửi đánh giá
        </Button>,
      ]}
      className="[&_.ant-modal-content]:!rounded-2xl [&_.ant-modal-content]:!p-6"
    >
      <Form
        form={form}
        layout="vertical"
        name="review_form"
        initialValues={{ rating: 5 }}
      >
        <div className="flex flex-col items-center justify-center mb-8 bg-slate-50 p-6 rounded-xl border border-dashed border-slate-200">
          <Form.Item
            name="rating"
            noStyle
            rules={[{ required: true, message: "Vui lòng chọn số sao!" }]}
          >
            <Rate
              className="text-4xl"
              style={{ fontSize: 36 }}
              onChange={(val) => setStarValue(val)}
              onHoverChange={(val) => {
                if (val) setStarValue(val);
                else {
                  const currentVal = form.getFieldValue("rating") || 5;
                  setStarValue(currentVal);
                }
              }}
            />
          </Form.Item>

          <div
            className={`mt-3 text-lg font-bold transition-all duration-300 ${
              ratingConfig[starValue]?.color || "text-gray-400"
            }`}
          >
            <span className="mr-2 text-2xl">
              {ratingConfig[starValue]?.emoji}
            </span>
            {ratingConfig[starValue]?.label}
          </div>
        </div>

        <Form.Item
          name="comment"
          label={
            <span className="font-semibold text-gray-700">
              Nội dung chi tiết
            </span>
          }
        >
          <Input.TextArea
            rows={4}
            placeholder="Hãy chia sẻ những điều bạn thích và chưa thích về khóa học này..."
            className="!rounded-lg !border-gray-300 focus:!border-blue-500 focus:!shadow-sm text-base py-3"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReviewForm;
