import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useReducer, useRef, useState } from "react";
import { useEffect } from "react";
import API from "../services/api";
import { usePresence } from "../context/PresenceContext";
import { useNotifications } from "../context/NotificationContext";
import { useTabVisibility } from "../hooks/useTabVisibility";

function Home() {
  const { selectedChat, setSelectedChat } = useNotifications();
  const [rooms, setRooms] = useState([]);
  const { onlineUsers } = usePresence();

  const fetchRooms = async () => {
    try {
      const res = await API.get("/chat/rooms/");
      setRooms(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSelectChat = async (room) => {
    setSelectedChat(room);

    // refetch rooms to update unread_count
    await fetchRooms();
  };

    useEffect(() => {
      console.log("online users updated:", onlineUsers);
    }, [onlineUsers]);


  return (
    <div className="flex h-screen">
      <Sidebar
        rooms={rooms}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
        refreshRooms={fetchRooms}
      />
      <ChatWindow
       selectedChat={selectedChat}
       setSelectedChat={setSelectedChat}
       refreshRooms={fetchRooms} 
      />
    </div>
  );
}

export default Home;