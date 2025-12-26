import React, { useState, useEffect, useRef } from "react";
import apiClient from "../../api/axiosConfig";
import {
  SendOutlined,
  LoadingOutlined,
  CloseOutlined,
  ArrowRightOutlined,
  ExpandAltOutlined,
  ShrinkOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import chatbotIcon from "../../imgs/chatbot-icon.png";
import imgbg from "../../imgs/image.png";
import ReactMarkdown from "react-markdown";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBodyRef = useRef(null);
  const navigate = useNavigate();

  const { state } = useAuth();
  const { currentUser } = state;

  const suggestionQuestions = [
    "Muốn làm giảng viên tiếng Anh học gì?",
    "Xem bóng đá Châu Âu học gì?",
    "Sắp đi du học Đức học gì?",
  ];

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        sender: "bot",
        type: "text",
        text: `Xin chào ${
          currentUser?.fullname || "anh/chị"
        }, em là trợ lý ảo của DREAM. Anh/chị cần tìm hiểu thông tin gì nói cho em biết nhé?`,
      };
      setMessages([welcomeMessage]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isOpen, isExpanded]);

  const toggleChat = () => setIsOpen(!isOpen);

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSend = async (messageText) => {
    const textToSend = messageText || inputValue;
    if (textToSend.trim() === "" || isLoading) return;

    setShowSuggestions(false);

    const userMessage = { sender: "user", type: "text", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await apiClient.post("/chatbot/ask", {
        message: textToSend,
      });
      const botMessage = {
        sender: "bot",
        type: response.data.type || "text",
        text: response.data.reply,
        data: response.data.data,
      };
      setMessages((prev) => [...prev, botMessage]);
      console.log("kết quả", response.data);
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        type: "text",
        text: "Xin lỗi, tôi đang gặp sự cố kết nối.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const badgeStyles =
      "px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm uppercase whitespace-nowrap";
    switch (status) {
      case "upcoming":
        return (
          <span className={`${badgeStyles} bg-blue-500`}>Sắp diễn ra</span>
        );
      case "ongoing":
        return (
          <span className={`${badgeStyles} bg-emerald-500`}>Đang diễn ra</span>
        );
      case "finished":
        return <span className={`${badgeStyles} bg-red-500`}>Đã kết thúc</span>;
      default:
        return <span className={`${badgeStyles} bg-gray-400`}>{status}</span>;
    }
  };

  return (
    <div
      className={`
            z-[2000] flex flex-col items-end gap-4 pointer-events-none
            ${
              isExpanded
                ? "fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm justify-center items-center p-4"
                : "fixed bottom-[20px] md:bottom-[30px] right-[20px]"
            }
        `}
    >
      {/* Cửa sổ Chat */}
      <div
        className={`
                    bg-gray-50 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 pointer-events-auto
                    ${
                      isExpanded
                        ? "w-full max-w-5xl h-full max-h-[90vh] rounded-xl"
                        : "w-[360px] md:w-[400px] h-[550px] rounded-2xl origin-bottom-right"
                    }
                    ${
                      isOpen
                        ? "scale-100 opacity-100 visible"
                        : "scale-0 opacity-0 invisible"
                    }
                `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 font-bold text-base flex justify-between items-center shadow-md z-10 shrink-0">
          <span className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-blue-600 absolute bottom-0 right-0"></div>
              <img
                src={chatbotIcon}
                alt="Bot"
                className="w-8 h-8 rounded-full bg-white p-0.5"
              />
            </div>
            <span>Trợ lý ảo DREAM</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleExpand}
              className="w-8 h-8 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 rounded-full transition cursor-pointer"
              title={isExpanded ? "Thu nhỏ" : "Phóng to"}
            >
              {isExpanded ? <ShrinkOutlined /> : <ExpandAltOutlined />}
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                setIsExpanded(false);
              }}
              className="w-8 h-8 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 rounded-full transition cursor-pointer"
            >
              <CloseOutlined />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div
          className="flex-1 p-4 overflow-y-auto flex flex-col gap-5 scroll-smooth bg-[#f3f4f6]"
          ref={chatBodyRef}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col w-full animate-fade-in ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              {/* Bong bóng tin nhắn */}
              <div
                className={`
                    max-w-[85%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm
                    ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                    }
                `}
              >
                <ReactMarkdown
                  components={{
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc ml-4 mt-2 space-y-1"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => <li className="" {...props} />,
                    p: ({ node, ...props }) => (
                      <p className="mb-1 last:mb-0" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <span className="font-bold" {...props} />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>

              {/* Danh sách khóa học dạng Bảng (Nếu có) */}
              {msg.type === "course_list" &&
                msg.data &&
                msg.data.length > 0 && (
                  <div
                    className={`mt-3 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${
                      isExpanded ? "max-w-4xl" : "max-w-full"
                    }`}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">
                              Khóa học
                            </th>
                            <th className="px-4 py-3 text-center font-semibold">
                              Giá
                            </th>
                            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">
                              Khai giảng
                            </th>
                            <th className="px-4 py-3 text-center font-semibold">
                              Trạng thái
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {msg.data.map((c) => (
                            <tr
                              key={c._id}
                              className="cursor-pointer hover:bg-blue-50/50 transition-colors duration-200"
                              onClick={() => {
                                if (isExpanded) setIsExpanded(false);
                                navigate(`/courses/${c._id}`);
                              }}
                            >
                              <td className="px-4 py-3 font-medium text-gray-800">
                                {c.language_id?.language} -{" "}
                                {c.languagelevel_id?.language_level}
                                <div className="text-xs text-gray-500 font-normal mt-0.5">
                                  GV: {c.teacher_id?.full_name}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center whitespace-nowrap align-middle">
                                <div className="flex flex-col items-center justify-center">
                                  <span className="text-red-600 font-bold text-sm">
                                    {c.discounted_price !== undefined
                                      ? c.discounted_price.toLocaleString()
                                      : c.Tuition.toLocaleString()}
                                    ₫
                                  </span>
                                  {c.discount_percent > 0 && (
                                    <span className="text-xs text-gray-400 line-through mt-0.5">
                                      {c.Tuition.toLocaleString()}₫
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">
                                {new Date(c.Start_Date).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {getStatusTag(c.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
          ))}

          {isLoading && (
            <div className="self-start bg-white border border-gray-200 text-gray-500 px-4 py-2 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-sm animate-pulse">
              <LoadingOutlined /> Đang soạn tin...
            </div>
          )}
        </div>

        {/* Suggestions */}
        {showSuggestions && !isLoading && (
          <div className="px-4 py-3 bg-[#f3f4f6] flex flex-wrap gap-2 justify-end border-t border-gray-200/50">
            {suggestionQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-50 hover:border-blue-400 hover:shadow-sm transition active:scale-95 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Footer Input */}
        <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={isLoading}
            className="flex-1 bg-gray-100 border border-transparent rounded-full px-5 py-3 text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputValue.trim()}
            className={`
                w-11 h-11 rounded-full flex items-center justify-center transition shadow-md cursor-pointer
                ${
                  isLoading || !inputValue.trim()
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95"
                }
            `}
          >
            <SendOutlined className="text-lg ml-0.5" />
          </button>
        </div>
      </div>

      {/* Toggle Button (Icon mở chat) */}
      {!isExpanded && (
        <button
          className={`
                w-[60px] h-[60px] rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white border-none cursor-pointer flex items-center justify-center text-3xl shadow-[0_8px_30px_rgba(37,99,235,0.4)] 
                hover:scale-110 transition-transform duration-300 p-0 overflow-hidden ring-4 ring-white mb-[50px] pointer-events-auto
                ${isOpen ? "hidden" : "flex"}
            `}
          onClick={toggleChat}
        >
          <img
            src={chatbotIcon}
            alt=""
            className="w-full h-full object-cover"
          />
        </button>
      )}
    </div>
  );
}

export default Chatbot;
