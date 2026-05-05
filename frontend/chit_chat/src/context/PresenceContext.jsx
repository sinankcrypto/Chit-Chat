import { createContext, useContext, useEffect, useRef, useState } from "react";
import API from "../services/api";
import { useActionData } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const PresenceContext = createContext();

export const PresenceProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user } = useAuth();
  const { socketRef } = useSocket();

  const fetchOnlineUsers = async () => {
    try {
      const res = await API.get("/chat/online-users/");
      setOnlineUsers(new Set(res.data.online_users));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user){
      fetchOnlineUsers();
    }
  }, [user]);

  // Listen to socket events

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "presence"){
        setOnlineUsers((prev) => {
          const updated = new Set(prev);

          if (data.status === "online") {
            updated.add(data.user_id);
          } else {
            updated.delete(data.user_id);
          }

          return updated;
        });
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEvenetListener("message", handleMessage);
    };
  }, [socketRef.current]);

  return (
    <PresenceContext.Provider value={{ onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => useContext(PresenceContext);