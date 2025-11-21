import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Flex,
  Breadcrumb,
  Modal,
  Spin,
  message,
  Result,
  Tag,
  Avatar,
  Rate,
  Tooltip,
} from "antd";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";

function ReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [spinning, setSpinning] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const { state } = useAuth();
  const { currentUser } = state;

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  const columns = [
    {
      title: "Học viên",
      dataIndex: ["user_id"],
      render: (user) => (
        <Flex align="center" gap={8}>
          <Avatar src={user?.avatar} />
          <span>{user?.fullname || "N/A"}</span>
        </Flex>
      ),
      width: 250,
    },
    {
      title: "Khóa học",
      dataIndex: ["course_id", "courseid"],
      render: (courseid, record) => (
        <Link to={`/courses/${record.course_id?._id}`} target="_blank">
          {courseid}
        </Link>
      ),
    },
    {
      title: "Số sao",
      dataIndex: "rating",
      render: (rating) => (
        <Rate disabled defaultValue={rating} style={{ fontSize: 16 }} />
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
      render: (text) => (
        <Tooltip title={text} placement="topLeft">
          <div className="comment-cell">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: "Ngày đánh giá",
      dataIndex: "review_date",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(a.review_date) - new Date(b.review_date),
      defaultSortOrder: "descend",
    },
  ];

  const fetchData = async () => {
    setSpinning(true);
    try {
      const response = await apiClient.get(`/review`);
      const reviewsWithKey = response.data.map((review) => ({
        ...review,
        key: review._id,
      }));
      setReviews(reviewsWithKey);
    } catch (err) {
      errorMessage("Không thể tải danh sách đánh giá");
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    setSpinning(true);
    try {
      await apiClient.delete(`/review/multiple`, {
        data: { reviewIds: selectedRowKeys },
      });
      successMessage(`Đã xóa ${selectedRowKeys.length} đánh giá`);
      setSelectedRowKeys([]);
      await fetchData();
    } catch (error) {
      errorMessage(error.response?.data?.message || "Xóa đánh giá thất bại");
    } finally {
      setOpenDeleteConfirm(false);
      setSpinning(false);
    }
  };

  if (!currentUser || currentUser.role !== "Admin") {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
      />
    );
  }

  return (
    <Flex vertical gap={20} className="ReviewManager">
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý đánh giá" }]}
      />

      {selectedRowKeys.length > 0 && (
        <Flex align="center" justify="space-between" className="selection-bar">
          <span>Đã chọn {selectedRowKeys.length} đánh giá</span>
          <Button
            type="primary"
            danger
            onClick={() => setOpenDeleteConfirm(true)}
          >
            Xoá mục đã chọn
          </Button>
        </Flex>
      )}

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        columns={columns}
        dataSource={reviews}
        bordered
        scroll={{ x: 1000 }}
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
          Bạn có chắc muốn xóa vĩnh viễn {selectedRowKeys.length} đánh giá đã
          chọn không?
        </p>
      </Modal>
    </Flex>
  );
}

export default ReviewManager;
