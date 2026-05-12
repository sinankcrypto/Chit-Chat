import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function GroupInfoModal({ room, onClose }) {
  const [members, setMembers] = useState(room.participants || []);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounce typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);

        const res = await API.get(
          `/auth/users/search/?q=${debouncedSearch}`
        );

        // remove already existing members
        const filteredResults = res.data.filter(
          (user) =>
            !members.some((member) => member.id === user.id)
        );

        setSearchResults(filteredResults);

      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearch, members]);

  // Add members
  const handleAdd = async (user) => {
    try {
      await API.post(`/chat/rooms/${room.id}/add-users/`, {
        users: [user.id],
      });

      setMembers((prev) => [...prev, user]);

      setSearchResults((prev) =>
        prev.filter((u) => u.id !== user.id)
      );

      toast.success("Added user successfully");

    } catch (err) {
      console.log(err);
      toast.error("Failed to add user");
    }
  };

  // Remove members
  const handleRemove = async (userId) => {
    try {
      await API.post(`/chat/rooms/${room.id}/remove-user/`, {
        user: userId,
      });

      setMembers((prev) =>
        prev.filter((member) => member.id !== userId)
      );

      toast.success("Removed user successfully");

    } catch (err) {
      console.log(err);
      toast.error("Failed to remove user");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-gray-900 w-96 rounded-xl p-6 border border-gray-800 shadow-xl">

        <h2 className="text-xl font-semibold text-white mb-4">
          Group Members
        </h2>

        {/* Current Members */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded-lg"
            >
              <span className="text-gray-200">
                {member.username}
              </span>

              <button
                onClick={() => handleRemove(member.id)}
                className="text-red-400 hover:text-red-300 text-sm transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Search/Add Members */}
        <div className="mt-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Search Results */}
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">

            {loading && (
              <div className="text-sm text-gray-400 p-2">
                Searching...
              </div>
            )}

            {!loading &&
              debouncedSearch &&
              searchResults.length === 0 && (
                <div className="text-sm text-gray-500 p-2">
                  No users found
                </div>
              )}

            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded-lg"
              >
                <span className="text-gray-200">
                  {user.username}
                </span>

                <button
                  onClick={() => handleAdd(user)}
                  className="text-green-400 hover:text-green-300 text-sm transition"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 transition py-2 rounded-lg text-white font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default GroupInfoModal;