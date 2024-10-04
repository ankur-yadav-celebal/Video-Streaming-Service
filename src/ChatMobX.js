import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import chatStore from "./stores/ChatStore";

const ChatMobX = observer(() => {
  const { user, messages, isConnected, firstMessageSent } = chatStore;
  const [message, setMessage] = useState("");
  const lastMessageRef = useRef(null);

  useEffect(() => {
    chatStore.connect();

    return () => {
      if (chatStore.connection) {
        chatStore.connection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSetUser = (e) => {
    chatStore.setUser(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      chatStore.sendMessage(message);
      setMessage("");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        chatStore.sendImage(base64Image);
      };
      reader.readAsDataURL(file); // Convert the image to base64
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        <ul className="messages">
          {messages.map((msg, index) => (
            <li
              key={index}
              className={msg.user === user ? "message self" : "message"}
              ref={index === messages.length - 1 ? lastMessageRef : null}
            >
              <div className="message-user">
                {msg.user !== user ? msg.user : null} <span>{msg.timestamp}</span>
              </div>
              <div className="message-text">
                {msg.message.startsWith("data:image/") ? (
                  <img src={msg.message} alt="Sent image" style={{ maxWidth: "200px" }} />
                ) : (
                  msg.message
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="input-section">
        <input
          type="text"
          className="input user-input"
          value={user}
          onChange={handleSetUser}
          placeholder="Your name"
          disabled={isConnected && user !== "" && firstMessageSent}
        />
        <input
          type="text"
          className="input message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={handleKeyPress}
          disabled={!isConnected || user === ""}
        />
        <input type="file" className="input file-upload" onChange={handleImageUpload} disabled={!isConnected || user === ""} />
        <button
          className="send-button"
          onClick={() => chatStore.sendMessage(message)}
          disabled={!isConnected || user === "" || message === ""}
        >
          Send
        </button>
      </div>
    </div>
  );
});

export default ChatMobX;
