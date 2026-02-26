import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";
import Logo from "../components/Logo";
import toast from "react-hot-toast";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/verify-otp/", {
        email,
        otp,
      });

      toast.success("OTP Verified Successfully!");

      navigate("/chat");

    } catch (error) {
      toast.error("Invalid OTP");
      console.log(error);
    }
  };

  if (!email) {
    navigate("/signup");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl w-96 shadow-lg">

        <Logo />

        <p className="text-gray-400 text-center mb-4">
          Enter the OTP sent to <span className="text-indigo-400">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white text-center tracking-widest text-lg"
          />

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded text-white">
            Verify OTP
          </button>
        </form>

      </div>
    </div>
  );
}

export default VerifyOtp;