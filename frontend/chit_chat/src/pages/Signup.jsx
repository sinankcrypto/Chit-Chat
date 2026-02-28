import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Logo from "../components/Logo";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match!");
      console.log(`pass: ${formData.password} conf: ${formData.confirm_password}`)
      return;
    }

    try {
        await API.post("/auth/register/", formData);
        toast.success("Account created successfully! Please verify the email");
        navigate("/verify-otp", {
            state: { email: formData.email },
        });
    } catch (err) {
        const errorData = err?.response?.data;
        let message = "Signup failed";
        if (typeof errorData === "object" && errorData !== null) {
            const firstKey = Object.keys(errorData)[0];
            message = errorData[firstKey]?.[0] || message;
        } else if (typeof errorData === "string") message = errorData;
        toast.error(message);
        console.error(errorData)
        }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl w-96 shadow-lg">

        <Logo />

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded text-white">
            Sign Up
          </button>
        </form>

        <p className="text-gray-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/" className="text-indigo-500">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;