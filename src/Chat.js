import React, { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { Modal, Typography, Button, Box } from '@mui/material'; // Import Button for better styling
import * as leoProfanity from 'leo-profanity';

const Chat = () => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(localStorage.getItem('user') || ''); // Get username from local storage
  const [isConnected, setIsConnected] = useState(false);
  const [firstMessageSent, setFirstMessageSent] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [isProfanityModalOpen, setIsProfanityModalOpen] = useState(false);

  const lastMessageRef = useRef(null);

  useEffect(() => {
    // Initialize English profanity filter
    leoProfanity.loadDictionary();
  }, []);


  const loadDictionaries = () => {
    const englishWords = leoProfanity.getDictionary();
    console.log("englishWords", englishWords);
    leoProfanity.loadDictionary('hi');
    const hindiWords = leoProfanity.getDictionary();
    console.log("hindiWords", hindiWords);
    const combinedProfanities = [...englishWords, ...hindiWords];
    leoProfanity.add(combinedProfanities);
  };

  // Load the dictionaries on component mount
  useState(() => {
    loadDictionaries();
  }, []);

  const hindiProfanityList = ['chutiye', 'bhosdike', 'madarchod', 'gandu', 'bhenchod'];

  const containsHindiProfanity = (text) => {
    return hindiProfanityList.some((badWord) =>
      text.toLowerCase().includes(badWord)
    );
  };

  const handleProfanityCheck = (text) => {
    // Check for English and Hindi offensive words
    const isEnglishProfane = leoProfanity.check(text);
    const isHindiProfane = containsHindiProfanity(text);

    if (isEnglishProfane || isHindiProfane) {
      setIsProfanityModalOpen(true); // Show modal
      return true;
    }
    return false;
  };

  useEffect(() => {
    const connect = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7064/chathub", {
        transport: signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents |
          signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connect.serverTimeoutInMilliseconds = 100000; // 100 seconds, adjust as needed

    setConnection(connect);

    connect.start()
      .then(async () => {
        console.log("Connected to SignalR");
        setIsConnected(true);

        // Retrieve chat history on connection
        try {
          const history = await connect.invoke("GetChatHistory");
          setMessages(history.map(entry => {
            const [user, message, timestamp] = entry.split("~");
            return { user, message, timestamp, status: 'sent' };
          }));
        } catch (error) {
          console.error("Error retrieving chat history: ", error);
        }

        connect.on("ReceiveMessage", (user, message, timestamp, messageId, status) => {
          setMessages(prevMessages =>
            [...prevMessages, { user, message, timestamp, messageId, status }]);
        });

        connect.on("MessageRead", (messageId) => {
          updateMessageStatus(messageId, 'read');
        });
      })
      .catch(error => console.error("Connection failed: ", error));

    connect.onreconnected(() => {
      console.log("Reconnected");
      setIsConnected(true);
    });

    connect.onclose(() => {
      console.log("Connection closed");
      setIsConnected(false);
    });

    return () => {
      connect.stop();
    };
  }, []);

  useEffect(() => {
    // Scroll to the last message whenever the messages array changes
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (connection) {
      connection.on("UserTyping", (user) => {
        setIsTyping(true);
        setTypingUser(user);
      });

      connection.on("UserStoppedTyping", () => {
        setIsTyping(false);
        setTypingUser('');
      });
    }
  }, [connection]);

  useEffect(() => {
    if (isConnected && connection && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (user !== lastMessage.user && lastMessage.status !== 'read') {
        connection.invoke("UserReadMessage", lastMessage.user, lastMessage.messageId);
        updateMessageStatus(lastMessage.messageId, 'read');
      }
    }
  }, [messages, connection, isConnected, user]);

  const updateMessageStatus = (messageId, status) => {
    setMessages(prevMessages => prevMessages.map(msg =>
      msg.messageId === messageId ? { ...msg, status } : msg
    ));
  };

  const handleSetUser = (e) => {
    setUser(e.target.value);
    localStorage.setItem('user', e.target.value); // Store username in local storage
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    } else {
      sendTypingNotification();
    }
  };

  let typingTimeout = null;

  const sendTypingNotification = () => {
    if (isConnected && connection) {
      connection.invoke("UserTyping", user);
      clearTimeout(typingTimeout);

      typingTimeout = setTimeout(() => {
        connection.invoke("UserStoppedTyping", user);
      }, 3000);
    }
  };

  const sendMessage = async () => {
    if (isConnected && connection) {
      if (handleProfanityCheck(message)) {
        return; // Do not send the message if it contains offensive words
      }
      try {
        const cleanMessage = leoProfanity.clean(message); // Clean message (English)
        await connection.invoke("SendMessage", user, cleanMessage);
        setMessage(''); // Clear the input field after sending
        setFirstMessageSent(true);
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    } else {
      console.warn("Connection is not ready. Please wait.");
    }
  };


  const handleCloseModal = () => {
    setIsProfanityModalOpen(false);
  };

  useEffect(() => {
    // Event listener for keydown
    const handleKeyDown = (event) => {
      console.log("handleKeyDown",handleKeyDown);
      if (event.key === 'Enter') {
        handleCloseModal(); // Close the modal when Enter is pressed
      }
    };

    // Attach the event listener when the modal is open
    if (isProfanityModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    // Clean up the event listener on unmount or when modal closes
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfanityModalOpen]); // Depend on the modal's open state

  return (
    <div className="chat-container">
      <div className="chat-window">
        <ul className="messages">
          {messages.map((msg, index) => (
            <li
              key={index}
              className={msg.user === user ? "message self" : "message"}
              ref={index === messages.length - 1 ? lastMessageRef : null} // Set ref on the last message
            >
              <div className="message-user">{msg.user !== user ? msg.user : null} <span>{msg.timestamp}</span></div>
              <div className="message-text">{msg.message}</div>
              <div className="message-status">
                {msg.user === user && msg.status === 'sent' && <span>✓</span>}
                {msg.user === user && msg.status === 'read' && <span style={{ color: 'blue' }}>✓✓</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {isTyping && <div className="typing-notification">{typingUser} is typing...</div>}
      <div className="input-section">
        <input
          type="text"
          className="input user-input"
          value={user}
          onChange={handleSetUser}
          placeholder="Your name"
          disabled={isConnected && (user !== '' && firstMessageSent)} // Disable once username is set
        />
        <input
          type="text"
          className="input message-input"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={handleKeyPress} // Add keypress event to trigger sending message on Enter
          disabled={!isConnected || user === ''}  // Disable if not connected or no username
        />
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={!isConnected || user === '' || message === ''}
        >
          Send
        </button>
      </div>

      {/* Modal to show profanity alert */}
      <Modal
        open={isProfanityModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="profanity-modal-title"
        aria-describedby="profanity-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            outline: 'none',
          }}
        >
          <Typography id="profanity-modal-title" variant="h6" component="h2" gutterBottom>
            🚫 Offensive Language Detected
          </Typography>
          <Typography id="profanity-modal-description" variant="body1" gutterBottom>
            You cannot use offensive words in the chat. Your message will not be sent.
          </Typography>
          <Box textAlign="right">
            <Button variant="contained" color="primary" onClick={handleCloseModal}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Chat;
