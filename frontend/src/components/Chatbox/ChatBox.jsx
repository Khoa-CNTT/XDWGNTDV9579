import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaComments, FaTimes } from "react-icons/fa";
import "./chatbox.css";

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Xin chào! Tôi có thể giúp gì cho bạn?", sender: "bot" },
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
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay 2 giây
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
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      let errorMessage = "Xin lỗi, có lỗi xảy ra!";
      if (error.response?.status === 429) {
        errorMessage = "Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau vài phút!";
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: errorMessage, sender: "bot" },
      ]);
    }
  };

  // Hỗ trợ gửi tin nhắn bằng phím Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      {!isOpen && (
        <button className="chatbox-icon" onClick={toggleChatbox}>
          <FaComments />
        </button>
      )}
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
              onKeyPress={handleKeyPress} // Thêm sự kiện Enter
              placeholder="Nhập tin nhắn..."
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;