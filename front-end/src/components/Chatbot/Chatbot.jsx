import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/axiosConfig';
import './Chatbot.css';
import {SendOutlined, LoadingOutlined, CloseOutlined } from "@ant-design/icons";
import { useAuth } from '../../context/AuthContext';

import chatbotIcon from '../../imgs/chatbot-icon.png';

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatBodyRef = useRef(null);
    
    const { state } = useAuth();
    const { currentUser } = state;

    // Các câu hỏi gợi ý
    const suggestionQuestions = [
        "Khóa học Tiếng Anh có những cấp độ nào?",
        "Học phí khóa học Tiếng Trung là bao nhiêu?",
        "Khóa học Tiếng Pháp kéo dài trong bao lâu?",
    ];

    useEffect(() => {
        const welcomeMessage = {
            sender: 'bot',
            text: `Xin chào ${currentUser?.fullname || 'bạn'}, em là trợ lý ảo của DREAM. Em có thể giúp gì cho anh/chị ạ?`
        };
        setMessages([welcomeMessage]);
    }, [currentUser]);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async (messageText) => {
        const textToSend = messageText || inputValue;
        if (textToSend.trim() === '' || isLoading) return;

        const userMessage = { sender: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await apiClient.post('/chatbot/ask', { message: textToSend });
            const botMessage = { sender: 'bot', text: response.data.reply };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = { sender: 'bot', text: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            <div className={`chat-window ${isOpen ? 'open' : ''}`}>
                <div className="chat-header">
                    <span>Trợ lý ảo DREAM</span>
                    <button onClick={toggleChat}><CloseOutlined /></button>
                </div>
                <div className="chat-body" ref={chatBodyRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-bubble ${msg.sender}`}>
                            <div className="message-text">{msg.text}</div>
                        </div>
                    ))}
                    {isLoading && <div className="message-bubble bot"><div className="message-text"><LoadingOutlined /></div></div>}
                </div>
                {messages.filter(m => m.sender === 'user').length === 0 && (
                    <div className="suggestion-bubbles">
                        {suggestionQuestions.map((q, i) => (
                            <button key={i} onClick={() => handleSend(q)}>{q}</button>
                        ))}
                    </div>
                )}
                <div className="chat-footer">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Nhập tin nhắn..."
                        disabled={isLoading}
                    />
                    <button onClick={() => handleSend()} disabled={isLoading}><SendOutlined /></button>
                </div>
            </div>

            <button className="chat-toggle-button" onClick={toggleChat}>
                <img src={chatbotIcon} alt="Chatbot Icon" />
            </button>
        </div>
    );
}

export default Chatbot;