import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function CreateGroupModal({ onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // 🔎 Search users
  const searchUsers = async (value) => {
    setSearchTerm(value);

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await API.get(`/auth/users/search/?q=${value}`);
      setSearchResults(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ➕ Add user
  const addUser = (user) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // ❌ Remove user
  const removeUser = (id) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== id));
  };

  // 🚀 Create group
  const createGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name required");
      return;
    }

    if (selectedUsers.length < 2) {
      toast.error("Select at least 2 users");
      return;
    }

    try {
      await API.post("/chat/rooms/", {
        room_type: "group",
        name: groupName,
        participant_ids: selectedUsers.map((u) => u.id),
      });
      toast.success("Group created successfully")

      onGroupCreated();
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Failed to create group");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl w-96 text-white">

        <h2 className="text-xl font-semibold mb-4">
          Create Group
        </h2>

        {/* Group Name */}
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700"
        />

        {/* Search Users */}
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => searchUsers(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700"
        />

        {/* Search Results */}
        <div className="max-h-32 overflow-y-auto mb-3">
          {searchResults.map((user) => (
            <div
              key={user.id}
              onClick={() => addUser(user)}
              className="p-2 hover:bg-gray-700 cursor-pointer rounded"
            >
              {user.username}
            </div>
          ))}
        </div>

        {/* Selected Users */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-indigo-600 px-2 py-1 rounded text-sm flex items-center gap-2"
            >
              {user.username}
              <button
                onClick={() => removeUser(user.id)}
                className="text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-600 rounded"
          >
            Cancel
          </button>

          <button
            onClick={createGroup}
            className="px-3 py-2 bg-indigo-600 rounded"
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
}

export default CreateGroupModal;