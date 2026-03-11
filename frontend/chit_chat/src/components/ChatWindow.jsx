import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import GroupInfoModal from "./GroupInfoModal";
import EmojiPicker from "emoji-picker-react";

const WS_URL = import.meta.env.VITE_WS_BASE_URL; 

function ChatWindow({ selectedChat, refreshRooms }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [file, setFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

  // Fetch old messages
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const res = await API.get(
          `/chat/rooms/${selectedChat.id}/messages/`
        );
        setMessages(res.data.results.reverse());
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

    socketRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      setMessages((prev) => [...prev, data]);

      // refresh sidebar data
      await refreshRooms?.();
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

  const handleSendMessage = async () => {
    if (!newMessage && !file) return;

    try {
      let file_id = null;

      // Upload file if exists
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("room", selectedChat.id);

        const res = await API.post(`/chat/rooms/${selectedChat.id}/upload/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        file_id = res.data.file_id
      }

      socketRef.current.send(
        JSON.stringify({
          message: newMessage,
          file_id: file_id,
        })
      );

      setNewMessage("");
      setFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
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
      <div className="flex justify-between items-center border-b border-gray-700 p-4">
        <h2 className="text-xl font-semibold">
          {selectedChat.display_name}
        </h2>

        {selectedChat.room_type === "group" && (
          <button
            onClick={() => setShowGroupInfo(true)}
            className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
          >
            Group Info
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => {
          const sender = msg.sender;
          const isOwn = msg.is_me? msg.is_me: sender==currentUserUsername;
          const fileUrl = msg.file_url
          ? `${import.meta.env.VITE_API_BASE_URL}${msg.file_url}`
          : null;

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

                {/* Text */}
                {(msg.content || msg.message) && (
                  <p>{msg.content || msg.message}</p>
                )}

                {/* Image */}
                {msg.file_url && (
                  <img
                    src={fileUrl}
                    className="mt-2 rounded max-h-60"
                  />
                )}

                <p className="text-[10px] text-gray-300 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {showEmoji && (
        <div className="absolute bottom-20">
          <EmojiPicker
            onEmojiClick={(emojiData) =>
              setNewMessage((prev) => prev + emojiData.emoji)
            }
          />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-700 p-3 flex items-center gap-2">

        {/* Emoji Button */}
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="text-xl"
        >
          😀
        </button>

        {/* File Upload */}
        <label className="cursor-pointer text-xl">
          📎
          <input
            type="file"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        {/* Message Input */}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message"
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2"
        />

        {file && (
          <div className="p-2 text-sm text-gray-400">
            Selected: {file.name}
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          className="bg-indigo-600 px-4 py-2 rounded"
        >
          Send
        </button>

      </div>
      {showGroupInfo && (
        <GroupInfoModal
          room={selectedChat}
          onClose={() => setShowGroupInfo(false)}
          refreshRooms={refreshRooms}
        />
      )}
    </div>

  );
}

export default ChatWindow;