import React from "react";
import "./chatbox.css";

const ChatIcon = ({ toggleChat }) => {
  return (
    <button className="chat-icon" onClick={toggleChat}>
      💬
    </button>
  );
};

export default ChatIcon;