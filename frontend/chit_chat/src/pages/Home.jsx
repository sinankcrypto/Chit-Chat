import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useReducer, useRef, useState } from "react";
import { useEffect } from "react";
import API from "../services/api";
import { usePresence } from "../context/PresenceContext";
import { useNotifications } from "../context/NotificationContext";
import { useTabVisibility } from "../hooks/useTabVisibility";
import { useChat } from "../context/chatContext";

function Home() {
  const { selectedChat, setSelectedChat } = useNotifications();
  const { rooms } = useChat();
  const { onlineUsers } = usePresence();

  const handleSelectChat = async (room) => {
    setSelectedChat(room);
  };

    useEffect(() => {
      console.log("online users updated:", onlineUsers);
    }, [onlineUsers]);


  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        rooms={rooms}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
      />
      <ChatWindow
       selectedChat={selectedChat}
       setSelectedChat={setSelectedChat}
      />
    </div>
  );
}

export default Home;