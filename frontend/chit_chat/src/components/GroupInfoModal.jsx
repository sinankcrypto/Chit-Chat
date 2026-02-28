import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function GroupInfoModal({ room, onClose, refreshRooms }) {
  const [members, setMembers] = useState(room.participants || []);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Search users
  const handleSearch = async (value) => {
    setSearch(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const res = await API.get(`/auth/users/search/?q=${value}`);
    setSearchResults(res.data);
  };

  // Add members
  const handleAdd = async (userId) => {
    await API.post(`/chat/rooms/${room.id}/add-users/`, {
      users: [userId],
    });
    toast.success("Added user successfully")

    await refreshRooms();
    onClose();
  };

  // Remove members
  const handleRemove = async (userId) => {
    await API.post(`/chat/rooms/${room.id}/remove-user/`, {
      user: userId,
    });
    toast.success("Removed user successfully")

    await refreshRooms();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-900 w-96 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Group Members
        </h2>

        {/* Current Members */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center bg-gray-800 p-2 rounded"
            >
              <span>{member.username}</span>

              <button
                onClick={() => handleRemove(member.id)}
                className="text-red-400 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Add Members */}
        <div className="mt-4">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          />

          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center bg-gray-800 p-2 rounded"
              >
                <span>{user.username}</span>

                <button
                  onClick={() => handleAdd(user.id)}
                  className="text-green-400 text-sm"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-indigo-600 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default GroupInfoModal;