import Logo from "./Logo";
import ChatList from "./ChatList";
import ProfileDropdown from "./ProfileDropdown";
import { useState } from "react";
import CreateGroupModal from "./CreateGroupModal";
import API from "../services/api";

function Sidebar({ onSelectChat, refreshRooms, rooms  }) {
  const [showModal, setShowModal] = useState(false);  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // 🔎 Search users
  const searchUsers = async (value) => {
    setSearchTerm(value);

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await API.get(`auth/users/search/?q=${value}`);
      setSearchResults(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 💬 Start private chat
  const startPrivateChat = async (user) => {
    try {
      const res = await API.post("/chat/rooms/", {
        room_type: "private",
        participant_ids: [user.id],
      });

      const room = res.data;

      setSearchTerm("");
      setSearchResults([]);

      await refreshRooms();      // refresh sidebar
      onSelectChat(room);        // auto open chat

    } catch (err) {
      console.log(err.response?.data);
    }
  };

  return (
    <div className="w-1/3 bg-gray-800 h-screen p-4 border-r border-gray-700 flex flex-col">
      
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Chats</h2>
        <ProfileDropdown />
      </div>

      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => searchUsers(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />

        {searchResults.length > 0 && (
          <div className="absolute w-full bg-gray-900 mt-1 rounded shadow-lg max-h-48 overflow-y-auto z-10">
            {searchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => startPrivateChat(user)}
                className="p-2 hover:bg-gray-700 cursor-pointer"
              >
                {user.username}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat List */}
      <ChatList rooms={rooms} onSelectChat={onSelectChat} />

      <button
        onClick={() => setShowModal(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm mt-3"
      >
        + Create Group
      </button>

      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onGroupCreated={() => {
            setShowModal(false);
            onSelectChat(null); // optional reset
          }}
        />
      )}
    </div>
  );
}

export default Sidebar;