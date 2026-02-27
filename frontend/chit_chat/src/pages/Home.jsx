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


  return (
    <div className="flex h-screen">
      <Sidebar
        rooms={rooms}
        onSelectChat={setSelectedChat} 
        refreshRooms={fetchRooms}
      />
      <ChatWindow selectedChat={selectedChat} />
    </div>
  );
}

export default Home;