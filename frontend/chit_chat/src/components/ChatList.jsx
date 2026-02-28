import { useEffect, useState } from "react";
import API from "../services/api";

function ChatList({ rooms, onSelectChat  }) {
  return (
    <div className="mt-4 space-y-2">
      {rooms.map((room) => (
        <div
          key={room.id}
          onClick={() => onSelectChat(room)}
          className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer"
        >
          <h3 className="text-white font-semibold">{room.name?room.name:room.display_name}</h3>
          {room.room_type=='group'&&
            <p className="text-gray-400 text-sm">
              {room.participants.length} members
            </p>
          }
        </div>
      ))}
    </div>
  );
}

export default ChatList;