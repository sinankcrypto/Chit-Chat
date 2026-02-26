import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await API.post("/auth/logout/")
    toast.success("Logged out successfully")
    navigate('/')
  };

  return (
    <div className="relative">
      <FaUserCircle
        className="text-3xl text-white cursor-pointer"
        onClick={() => setOpen(!open)}
      />

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-lg">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;