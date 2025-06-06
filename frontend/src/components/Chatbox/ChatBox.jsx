import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaComments, FaTimes, FaTrash, FaFacebookMessenger, FaPhone } from "react-icons/fa";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./chatbox.css";

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen]);

  const fetchChatHistory = async () => {
    try {
      const response = await api.get("/chats");
      if (response.data.code === 200) {
        const history = response.data.history || [];
        const formattedMessages = history
          .filter((msg) => msg.role !== "system")
          .map((msg) => ({
            text: msg.content,
            sender: msg.role === "user" ? "user" : "bot",
          }));
        setMessages(formattedMessages);
      } else if (response.data.code === 400 && response.data.message.includes("token")) {
        toast.error("Vui lòng đăng nhập để sử dụng chat!");
        navigate("/login");
      } else {
        setMessages([{ text: "Xin chào! Tôi có thể giúp gì cho bạn?", sender: "bot" }]);
        toast.error(response.data.message || "Không thể tải lịch sử!");
      }
    } catch (error) {
      setMessages([{ text: "Xin chào! Tôi có thể giúp gì cho bạn?", sender: "bot" }]);
    }
  };

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, { ...userMessage, animate: true }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/chats", { message: userMessage.text });
      const botMessage = {
        text: response.data.reply || "Xin lỗi, tôi không hiểu!",
        sender: "bot",
        animate: true,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Có lỗi xảy ra!";
      if (error.response?.data?.message.includes("token")) {
        toast.error("Vui lòng đăng nhập để sử dụng chat!");
        navigate("/login");
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: errorMessage, sender: "bot", animate: true },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, navigate]);

  const clearChatHistory = async () => {
    try {
      const response = await api.patch("/chats/clear");
      if (response.data.code === 200) {
        toast.success(response.data.message || "Đã xóa lịch sử!");
        setMessages([{ text: "Xin chào! Tôi có thể giúp gì cho bạn?", sender: "bot" }]);
      } else if (response.data.code === 400 && response.data.message.includes("token")) {
        toast.error("Vui lòng đăng nhập để xóa lịch sử!");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Không thể xóa lịch sử!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa lịch sử!");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const openMessenger = () => {
    window.open("https://www.facebook.com/profile.php?id=61575213824007", "_blank");
  };

  const callPhone = () => {
    window.location.href = "tel:+123456789";
  };

  return (
    <div className="chat-container">
      <div className="icon-group">
        <div className="chat-icon-wrapper">
          {!isOpen && (
            <button className="chatbox-icon" onClick={toggleChatbox}>
              <FaComments />
            </button>
          )}
          {!isOpen && <span className="chat-label">Bạn có thể gửi tư vấn ở đây</span>}
        </div>
        <button className="messenger-icon" onClick={openMessenger}>
          <FaFacebookMessenger />
        </button>
        <button className="phone-icon" onClick={callPhone}>
          <FaPhone />
        </button>
      </div>
      {isOpen && (
        <div className={`chatbox ${!isOpen ? "hidden" : ""}`}>
          <div className="chat-header">
            <span>Hỗ trợ tư vấn</span>
            <div>
              <button className="clear-btn" onClick={clearChatHistory}>
                <FaTrash /> Xóa
              </button>
              <button className="close-btn" onClick={toggleChatbox}>
                <FaTimes />
              </button>
            </div>
          </div>
          <div className="chatbox-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender} ${msg.animate ? "fade-in" : ""}`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="loading">
                <span>Đang xử lý</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbox-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={isLoading}>
              {isLoading ? "..." : "Gửi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;