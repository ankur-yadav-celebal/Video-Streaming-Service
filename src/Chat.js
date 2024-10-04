import React, { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { Filter } from 'bad-words';
import * as leoProfanity from 'leo-profanity';

const Chat = () => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(localStorage.getItem('user') || ''); // Get username from local storage
  const [isConnected, setIsConnected] = useState(false);  // New state to track connection status
  const [firstMessageSent, setFirstMessageSent] = useState(false); // New state variable
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');

  const lastMessageRef = useRef(null);


  const loadDictionaries = () => {
    // Load the default dictionary (English)
    const englishWords = leoProfanity.getDictionary();
  console.log("englishWords",englishWords);
    // Load the Hindi dictionary
    leoProfanity.loadDictionary('hi');
    const hindiWords = leoProfanity.getDictionary();
    console.log("hindiWords",hindiWords);
  
    // Combine English and Hindi words
    const combinedProfanities = [...englishWords, ...hindiWords];
  
    // Add the combined list to the filter
    leoProfanity.add(combinedProfanities);
  };

    // Load the dictionaries on component mount
    useState(() => {
      loadDictionaries();
    }, []);

  useEffect(() => {
    const connect = new signalR.HubConnectionBuilder()
      // .withUrl("https://poc-chat-api.azurewebsites.net/chathub", {
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
            [...prevMessages,  { user, message, timestamp, messageId, status }]);
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
      // console.log("lastMessage", lastMessage);
      if (user !== lastMessage.user && lastMessage.status !== 'read') {
        connection.invoke("UserReadMessage", lastMessage.user, lastMessage.messageId);
        updateMessageStatus(lastMessage.messageId, 'read');
      }
    }
  }, [messages, connection, isConnected, user]);

  // useEffect(() => {
  //   if (connection) {
  //     connection.on("MessageRead", (messageId) => {
  //       console.log("MessageRead event received with messageId: ", messageId);
  //       if (messageId) {
  //         updateMessageStatus(messageId, 'read');
  //       } else {
  //         console.error("MessageId is null or undefined");
  //       }
  //     });
  //   }
  // }, [connection]);

  const updateMessageStatus = (messageId, status) => {
    // console.log("updateMessageStatus: messageId", messageId);
    // console.log("updateMessageStatus: status", status);
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
      }, 3000);  // Stop typing after 3 seconds of inactivity
    }
  };

  const sendMessage = async () => {
    if (isConnected && connection) {
      try {
        // const filter = new Filter(); // Create a new instance of the profanity filter
        // console.log(filter.list);
        // const cleanMessage = filter.clean(message); // Clean the message

        const cleanMessage = leoProfanity.clean(message);
        console.log("Original message: ", message);
        console.log("Filtered message: ", cleanMessage);

        await connection.invoke("SendMessage", user, cleanMessage);
        setMessage('');
        setFirstMessageSent(true);
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    } else {
      console.warn("Connection is not ready. Please wait.");
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
              ref={index === messages.length - 1 ? lastMessageRef : null} // Set ref on the last message
            >
              <div className="message-user">{msg.user !== user ? msg.user : null} <span>{msg.timestamp}</span></div>
              <div className="message-text">{msg.message}</div>
              <div className="message-status">
                {/* Display the blue ticks only for the current user's sent messages that are read */}
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
    </div>
  );
};

export default Chat;
