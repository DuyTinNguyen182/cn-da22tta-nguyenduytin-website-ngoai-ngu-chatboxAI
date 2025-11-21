import React from "react";
import { Modal, Form, Input, Rate, Button } from "antd";

const ReviewForm = ({ open, onCreate, onCancel, loading }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      open={open}
      title="Viết đánh giá của bạn"
      okText="Gửi đánh giá"
      cancelText="Hủy"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" name="review_form">
        <Form.Item
          name="rating"
          label="Bạn đánh giá khóa học này mấy sao?"
          rules={[{ required: true, message: "Vui lòng chọn số sao!" }]}
        >
          <Rate />
        </Form.Item>
        <Form.Item name="comment" label="Nội dung đánh giá">
          <Input.TextArea
            rows={4}
            placeholder="Chia sẻ cảm nhận của bạn về khóa học..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReviewForm;
