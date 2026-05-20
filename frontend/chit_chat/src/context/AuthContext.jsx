import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";
import { requestNotificationPermission } from "../utils/requestNotificationPermission";
import toast, { useToasterStore } from "react-hot-toast";
import { setLogoutHandler } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
      
    requestNotificationPermission();
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout/");
    } catch (err) {
      console.log(err);
      toast.error("Error logging please try again after some time")
    }

    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully")
  };

  useEffect(() => {
    setLogoutHandler(logout);
  }, [])


  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);