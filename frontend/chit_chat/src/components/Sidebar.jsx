import Logo from "./Logo";
import ChatList from "./ChatList";
import ProfileDropdown from "./ProfileDropdown";
import { useState, useEffect } from "react";
import CreateGroupModal from "./CreateGroupModal";
import API from "../services/api";
import { usePresence } from "../context/PresenceContext";

function Sidebar({ selectedChat, onSelectChat, refreshRooms, rooms }) {
  const [showModal, setShowModal] = useState(false);  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { onlineUsers } = usePresence();
  const [activeIndex, setActiveIndex] = useState(-1);

  const [debouncedTerm, setDebouncedTerm] = useState("");

  const [isSearching, setIsSearching] = useState(false);

  // 🔎 Search users
  useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);

        const res = await API.get(`auth/users/search/?q=${debouncedTerm}`);
        setSearchResults(res.data);
      } catch (err) {
        console.log(err);
      } finally{
        setIsSearching(false);
      }
    };

    fetchUsers();
  }, [debouncedTerm]);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 400); // ⏱ 400ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchResults]);

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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 text-sm rounded-md bg-gray-700 text-white placeholder-gray-400"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              setActiveIndex((prev) =>
                prev < searchResults.length - 1 ? prev + 1 : prev
              );
            }

            else if (e.key === "ArrowUp") {
              setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
            }

            else if (e.key === "Enter") {
              if (activeIndex >= 0 && searchResults[activeIndex]) {
                startPrivateChat(searchResults[activeIndex]);
              }
            }
          }}
        />

        {(searchTerm.length >= 2) && (
          <div className="absolute w-full mt-2 rounded-lg shadow-lg max-h-56 overflow-y-auto z-10 
                          bg-gray-100 text-gray-900 border border-gray-300">

            {/* 🔄 Loading */}
            {isSearching && (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                Searching...
              </div>
            )}

            {/* ❌ No results */}
            {!isSearching && searchResults.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">
                No users found
              </div>
            )}

            {/* ✅ Results */}
            {!isSearching && searchResults.map((user, index) => (
              <div
                key={user.id}
                onClick={() => startPrivateChat(user)}
                className={`px-4 py-2 cursor-pointer flex justify-between items-center
                  ${index === activeIndex ? "bg-indigo-200" : "hover:bg-indigo-100"}
                `}
              >
                <span className="font-medium">{user.username}</span>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* Chat List */}
      <ChatList rooms={rooms} selectedChat={selectedChat} onSelectChat={onSelectChat} />

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