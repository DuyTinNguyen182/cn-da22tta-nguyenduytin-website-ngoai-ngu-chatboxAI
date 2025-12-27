import React from "react";
import { Avatar, Rate } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import moment from "moment";
import "moment/locale/vi";

const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <div className="text-4xl mb-2 opacity-30">
          <MessageOutlined className="text-4xl text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">
          Chưa có đánh giá nào cho khóa học này.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Chỉ dành cho học viên đã học tại trung tâm!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      {reviews.map((item, index) => (
        <div
          key={item._id || index}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <Avatar
                src={item.user_id?.avatar}
                alt={item.user_id?.fullname}
                size={48}
                className="border-2 border-blue-50 shadow-sm"
              >
                {item.user_id?.fullname?.charAt(0)?.toUpperCase()}
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-800 text-[15px] leading-tight">
                    {item.user_id?.fullname || "Người dùng ẩn"}
                  </h4>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {moment(item.review_date).fromNow()}
                  </span>
                </div>

                <Rate
                  disabled
                  defaultValue={item.rating}
                  style={{ fontSize: 14 }}
                />
              </div>

              <div className="mt-2">
                {/* <Rate
                  disabled
                  defaultValue={item.rating}
                  style={{ fontSize: 14, color: "#fadb14" }}
                /> */}
                <p className="mt-2 text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
                  {item.comment}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
