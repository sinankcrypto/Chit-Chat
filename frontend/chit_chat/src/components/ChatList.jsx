import { useEffect, useState } from "react";
import API from "../services/api";
import { usePresence } from "../context/PresenceContext";
import { useAuth } from "../context/AuthContext";
import { getOtherParticipant, getRoomDisplayName } from "../utils/chatHelpers";

function ChatList({ rooms, onSelectChat, selectedChat  }) {
  const sortedRooms = [...rooms].sort((a, b) => {
    const aTime = a.last_message?.timestamp || a.created_at;
    const bTime = b.last_message?.timestamp || b.created_at;
    return new Date(bTime) - new Date(aTime);
  });
  const { user } = useAuth();
  const currentUser = user
  const { onlineUsers } = usePresence();

  const getMessagePreview = (message) => {
    if (!message) {
      return "No messages yet";
    }

    const prefix =
      message.sender === currentUser.username
        ? "You: "
        : `${message.sender}: `;

    if (message.message_type === "text") {
      return `${prefix}${message.content}`;
    }

    if (message.message_type === "mixed") {
      return `${prefix}📎 ${message.content}`;
    }

    if (message.message_type === "file") {
      switch (message.file_type) {
        case "image":
          return `${prefix}🖼️ Photo`;

        case "video":
          return `${prefix}🎥 Video`;

        case "audio":
          return `${prefix}🎵 Audio`;

        default:
          return `${prefix}📎 File`;
      }
    }

    return prefix;
  };

  return (
    <div className="mt-2 space-y-1 overflow-y-auto flex-1">
      {sortedRooms.map((room) => {
        const isActive = selectedChat?.id === room.id;
        const otherUser = getOtherParticipant(room, currentUser);
        const roomName = getRoomDisplayName(room, currentUser);
        const isOnline = onlineUsers.has(otherUser?.id);

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
              <div className="flex items-center gap-2">
                <span>{roomName}</span>

                {isOnline && (
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </div>

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
                {getMessagePreview(room.last_message)}0
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