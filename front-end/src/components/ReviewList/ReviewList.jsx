import React from "react";
import { List, Avatar, Rate } from "antd";
import { Comment } from "@ant-design/compatible";
import moment from "moment";
import "moment/locale/vi";
import "./ReviewList.css";

const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <p>Chưa có đánh giá nào cho khóa học này.</p>;
  }

  return (
    <List
      className="review-list"
      itemLayout="horizontal"
      dataSource={reviews}
      renderItem={(item) => (
        <li>
          <Comment
            author={<a>{item.user_id?.fullname || "Người dùng ẩn"}</a>}
            avatar={
              <Avatar src={item.user_id?.avatar} alt={item.user_id?.fullname} />
            }
            content={
              <>
                <Rate disabled defaultValue={item.rating} />
                <p>{item.comment}</p>
              </>
            }
            datetime={<span>{moment(item.review_date).fromNow()}</span>}
          />
        </li>
      )}
    />
  );
};

export default ReviewList;
