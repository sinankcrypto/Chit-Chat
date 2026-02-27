import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useState } from "react";
import { useEffect } from "react";
import API from "../services/api";

function Home() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [rooms, setRooms] = useState([]);

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


  return (
    <div className="flex h-screen">
      <Sidebar
        rooms={rooms}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat} 
        refreshRooms={fetchRooms}
      />
      <ChatWindow selectedChat={selectedChat} refreshRooms={fetchRooms}/>
    </div>
  );
}

export default Home;