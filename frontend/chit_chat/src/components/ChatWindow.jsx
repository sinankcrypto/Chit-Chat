import { useEffect, useState, useRef } from "react";
import API from "../services/api";

const WS_URL = import.meta.env.VITE_WS_BASE_URL; 

function ChatWindow({ selectedChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch old messages
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const res = await API.get(
          `/chat/rooms/${selectedChat.id}/messages/`
        );
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // WebSocket connection
  useEffect(() => {
    if (!selectedChat) return;

    socketRef.current = new WebSocket(
      `${WS_URL}/chat/${selectedChat.id}/`
    );

    socketRef.current.onopen = () => console.log("Real-time chat connected");

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    socketRef.current.onclose = () => console.log("Chat disconnected");
    socketRef.current.onerror = (e) => console.error("WS Error:", e);

    return () => {
      socketRef.current.close();
    };
  }, [selectedChat]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    socketRef.current.send(
      JSON.stringify({ message: newMessage })
    );

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };


  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <h2>Select a chat to start messaging 💬</h2>
      </div>
    );
  }

  const currentUserUsername = localStorage.getItem("username"); 
  // Store this during login if not already

  return (
    <div className="flex-1 bg-gray-900 flex flex-col">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-700 text-white font-semibold">
        {selectedChat.name? selectedChat.name: selectedChat.display_name}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => {
          const sender = msg.sender;
          const content = msg.message || msg.content;
          const isOwn = msg.is_me? msg.is_me: sender==currentUserUsername;

          return (
            <div
              key={index}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-xl max-w-xs break-words ${
                  isOwn
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-800 text-white rounded-bl-none"
                }`}
              >
                {!isOwn && (
                  <p className="text-xs text-indigo-400 mb-1">
                    {sender}
                  </p>
                )}

                <p>{content}</p>

                <p className="text-[10px] text-gray-300 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 p-3 rounded-full bg-gray-800 text-white outline-none"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-3 bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-full text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;