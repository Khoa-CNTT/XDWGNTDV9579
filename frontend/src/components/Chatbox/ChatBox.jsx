import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaComments, FaTimes } from "react-icons/fa"; // Import icon
import "./chatbox.css";

const BoxChat = () => {
  const [isOpen, setIsOpen] = useState(false); // Trạng thái mở/đóng chatbox
  const [messages, setMessages] = useState([
    { text: "Xin chào! Tôi có thể giúp gì cho bạn?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: input }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      const botMessage = {
        text: response.data.choices[0]?.message?.content || "Xin lỗi, tôi không hiểu!",
        sender: "bot"
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Xin lỗi, có lỗi xảy ra!", sender: "bot" }
      ]);
    }
  };
  console.log("API Key:", process.env.REACT_APP_OPENAI_API_KEY);

  return (
    <div className="chat-container">
      {/* Nút mở chatbox (ẩn khi chatbox mở) */}
      {!isOpen && (
        <button className="chatbox-icon" onClick={toggleChatbox}>
          <FaComments />
        </button>
      )}

      {/* Chatbox hiển thị khi mở */}
      {isOpen && (
        <div className="chatbox">
          <div className="chat-header">
            <span>Hỗ trợ tư vấn</span>
            <button className="close-btn" onClick={toggleChatbox}>
              <FaTimes />
            </button>
          </div>
          <div className="chatbox-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbox-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoxChat;
