import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import GroupInfoModal from "./GroupInfoModal";
import EmojiPicker from "emoji-picker-react";
import { usePresence } from "../context/PresenceContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { Bell } from "lucide-react"
import React from "react";
import { useChat } from "../context/chatContext";

const WS_URL = import.meta.env.VITE_WS_BASE_URL; 

function ChatWindow({ selectedChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [file, setFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [preview, setPreview] = useState(null);
  const [viewerImage, setViewerImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [nextCursor, setNextCursor] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const messagesContainerRef = useRef(null);
  const initialLoadRef = useRef(true);

  const [firstUnreadId, setFirstUnreadId] = useState(null);
  const firstUnreadRef = useRef(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const { onlineUsers } = usePresence();

  const { user } = useAuth()

  const currentUserUsername = user.username;

  const { closeChat } = useChat();

  const otherUser = selectedChat?.participants?.find(
    (p) => p.username !== currentUserUsername
  );

  const isOnline = onlineUsers.has(otherUser?.id);

  const emojiRef = useRef(null);

  // Fetch old messages
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const res = await API.get(
          `/chat/rooms/${selectedChat.id}/messages/`
        );

        setMessages(res.data.results.reverse());
        setNextCursor(res.data.next);
        initialLoadRef.current = true;
        setFirstUnreadId(res.data.first_unread_id);

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

      // tell backend we saw the message
      socketRef.current.send(
        JSON.stringify({
          type: "read_messages",
          room_id: selectedChat.id,
        })
      );
    };

    socketRef.current.onclose = () => console.log("Chat disconnected");
    socketRef.current.onerror = (e) => console.error("WS Error:", e);

    return () => {
      socketRef.current.close();
    };
  }, [selectedChat]);

  // Auto-scroll
  useEffect(() => {
    if (!messages.length) return;

    // Initial chat open
    if (initialLoadRef.current) {
      if (firstUnreadId && firstUnreadRef.current) {
        firstUnreadRef.current.scrollIntoView({
          block: "center",
        });
      } else {
        messagesEndRef.current?.scrollIntoView();
      }

      initialLoadRef.current = false;
      return;
    }

    // When new messages arrive (via websocket)
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages, firstUnreadId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if ( emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        });

        file_id = res.data.file_id
      }

      socketRef.current.send(
        JSON.stringify({
          message: newMessage,
          file_id: file_id,
        })
      );
      console.log("message sent")

      setNewMessage("");
      setFile(null);
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && !loadingOlder) {
        loadOlderMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };

  }, [nextCursor, loadingOlder]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const loadOlderMessages = async () => {
    if (!nextCursor || loadingOlder) return;

    try {
      setLoadingOlder(true);

      const container = messagesContainerRef.current;
      const previousHeight = container.scrollHeight;

      const res = await API.get(nextCursor);

      const olderMessages = res.data.results.reverse();

      setMessages(prev => [...olderMessages, ...prev]);
      setNextCursor(res.data.next);

      setTimeout(() => {
        const newHeight = container.scrollHeight;
        container.scrollTop = newHeight - previousHeight;
      }, 0);

    } catch (err) {
      console.log(err);
    } finally {
      setLoadingOlder(false);
    }
  };


  if (!selectedChat) {
    return (
      <div className="flex-1 bg-gray-900 text-gray-400 relative">

        {/* Top bar */}
        <div className="flex justify-end p-4">

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 relative"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute top-14 right-4 w-80 bg-gray-800 rounded shadow-lg border border-gray-700 max-h-96 overflow-y-auto">

              <div className="flex justify-between items-center p-3 border-b border-gray-700">
                <h3 className="text-sm font-semibold">Notifications</h3>

                {notifications.length > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 && (
                <p className="p-4 text-sm text-gray-400 text-center">
                  No notifications
                </p>
              )}

              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3 border-b border-gray-700 flex justify-between items-center hover:bg-gray-700"
                >
                  <div className="text-sm">
                    <p className="font-medium">{n.sender}</p>
                    <p className="text-gray-400 text-xs">
                      {n.message?n.message:"New message"}
                    </p>
                  </div>

                  <button
                    onClick={() => markRead(n.id)}
                    className="text-green-400 text-sm"
                  >
                    ✓
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Center content */}
        <div className="flex items-center justify-center h-full">
          <h2>Select a chat to start messaging 💬</h2>
        </div>

      </div>
    );
  }

  return (
    <div ref={messagesContainerRef} className="flex-1 bg-gray-900 flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-700 p-4">
        <h2 className="text-xl font-semibold">
          {selectedChat.display_name}
        </h2>
        {selectedChat.room_type === "private" && (
          <p className="text-sm text-gray-400">
            {isOnline ? "Online" : "Offline"}
          </p>
        )}

        {selectedChat.room_type === "group" && (
          <button
            onClick={() => setShowGroupInfo(true)}
            className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
          >
            Group Info
          </button>
        )}

        {/* Close chat */}
        <button
          onClick={closeChat} 
          className="text-gray-400 hover:text-white text-lg"
        >
          ✕
        </button>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => {
          const sender = msg.sender;
          const isOwn = msg.is_me ?? (sender === currentUserUsername);
          const fileUrl = msg.file_url
          ? `${import.meta.env.VITE_API_BASE_URL}${msg.file_url}`
          : null;
          const fileType = msg.file_type;
          const isFirstUnread = msg.id === firstUnreadId;

          return (
            <React.Fragment key={msg.id}>
              {isFirstUnread && (
                <div className="flex justify-center my-3">
                  <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                    Unread Messages
                  </div>
                </div>
              )}
              <div
                ref={msg.id === firstUnreadId ? firstUnreadRef : null}
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

                  {/* MEDIA */}
                  {fileUrl && (

                    <>
                      {/* Image */}
                      {fileType?.startsWith("image") && (
                        <img
                          src={fileUrl}
                          className="mt-2 rounded max-h-60 cursor-pointer"
                          onClick={() => setViewerImage(fileUrl)}
                        />
                      )}

                      {/* Video */}
                      {fileType?.startsWith("video") && (
                        <video
                          controls
                          className="mt-2 rounded max-h-60"
                        >
                          <source src={fileUrl} type={fileType} />
                        </video>
                      )}

                      {/* Audio */}
                      {fileType?.startsWith("audio") && (
                        <audio
                          controls
                          className="mt-2 w-full"
                        >
                          <source src={fileUrl} type={fileType} />
                        </audio>
                      )}

                      {/* PDF */}
                      {fileType === "application/pdf" && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          className="block mt-2 text-blue-400 underline"
                        >
                          📄 View PDF
                        </a>
                      )}

                      {/* Other Files */}
                      {!fileType?.startsWith("image") &&
                        !fileType?.startsWith("video") &&
                        !fileType?.startsWith("audio") &&
                        fileType !== "application/pdf" && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            download
                            className="block mt-2 text-blue-400 underline"
                          >
                            📎 Download File
                          </a>
                        )}
                    </>
                  )}

                  <p className="text-[10px] text-gray-300 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {file && (
        <div className="px-4 py-2 border-t border-gray-700 bg-gray-850 flex items-center gap-3">

          {preview ? (
            <img
              src={preview}
              className="h-16 rounded"
            />
          ) : (
            <div className="text-sm text-gray-400">
              📎 {file.name}
            </div>
          )}

          <button
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
            className="text-red-400 text-sm"
          >
            Remove
          </button>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="px-4 py-1">
          <div className="w-full bg-gray-700 rounded h-2">
            <div
              className="bg-indigo-600 h-2 rounded"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      {/* Input */}
      <div className="border-t border-gray-700 p-3 flex items-center gap-2">

        <div ref={emojiRef} className="relative">

          {showEmoji && (
            <div className="absolute bottom-20">
              <EmojiPicker
                onEmojiClick={(emojiData) =>
                  setNewMessage((prev) => prev + emojiData.emoji)
                }
              />
            </div>
          )}

          {/* Emoji Button */}
          <button
            onClick={() => setShowEmoji(prev => !prev)}
            className="text-xl"
          >
            😀
          </button>

        </div>

        {/* File Upload */}
        <label className="cursor-pointer text-xl">
          📎
          <input
            type="file"
            hidden
            onChange={(e) => {
              const selected = e.target.files[0];
              setFile(selected);

              if (selected?.type.startsWith("image")) {
                setPreview(URL.createObjectURL(selected));
              } else {
                setPreview(null);
              }
            }}
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
        />
      )}

      {viewerImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setViewerImage(null)}
        >
          <img
            src={viewerImage}
            className="max-h-[90%] max-w-[90%] rounded"
          />
        </div>
      )}
    </div>

  );
}

export default ChatWindow;