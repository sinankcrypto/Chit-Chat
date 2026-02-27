import { useEffect, useState } from "react";
import API from "../services/api";

function ChatList({ onSelectChat }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await API.get("/chat/rooms/");
        setRooms(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="mt-4 space-y-2">
      {rooms.map((room) => (
        <div
          key={room.id}
          onClick={() => onSelectChat(room)}
          className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer"
        >
          <h3 className="text-white font-semibold">{room.name}</h3>
          <p className="text-gray-400 text-sm">
            {room.participants.length} members
          </p>
        </div>
      ))}
    </div>
  );
}

export default ChatList;