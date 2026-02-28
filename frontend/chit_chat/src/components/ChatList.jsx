import { useEffect, useState } from "react";
import API from "../services/api";

function ChatList({ rooms, onSelectChat, selectedChat  }) {
  const sortedRooms = [...rooms].sort((a, b) => {
    const aTime = a.last_message?.timestamp || a.created_at;
    const bTime = b.last_message?.timestamp || b.created_at;
    return new Date(bTime) - new Date(aTime);
  });
  const currentUser = localStorage.getItem("username");

  return (
    <div className="mt-2 space-y-1 overflow-y-auto flex-1">
      {sortedRooms.map((room) => {
        const isActive = selectedChat?.id === room.id;

        return (
          <div
            key={room.id}
            onClick={() => onSelectChat(room)}
            className={`p-3 rounded-lg cursor-pointer transition ${
              isActive
                ? "bg-gray-700"
                : "hover:bg-gray-700"
            }`}
          >
            {/* Top row */}
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold truncate">
                {room.display_name}
              </h3>

              {room.last_message && (
                <span className="text-xs text-gray-400">
                  {new Date(
                    room.last_message.timestamp
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>

            {/* Bottom row */}
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-400 truncate">
                {room.last_message
                  ? room.last_message.sender === currentUser
                  ? `You: ${room.last_message.content}`
                  : `${room.last_message.sender}: ${room.last_message.content}`
                  : "No messages yet"}
              </p>

              {room.unread_count > 0 && (
                <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                  {room.unread_count}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChatList;