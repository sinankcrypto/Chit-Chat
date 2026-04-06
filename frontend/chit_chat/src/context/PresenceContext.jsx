import { createContext, useContext, useEffect, useRef, useState } from "react";
import API from "../services/api";
import { useActionData } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PresenceContext = createContext();

export const PresenceProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const presenceSocket = useRef(null);
  const { user } = useAuth();

  const fetchOnlineUsers = async () => {
    try {
      const res = await API.get("/chat/online-users/");
      setOnlineUsers(new Set(res.data.online_users));
    } catch (err) {
      console.error(err);
    }
  };

  const disconnectPresence = () => {
    if (presenceSocket.current) {
      presenceSocket.current.close();
      presenceSocket.current = null;
      console.log("Presence socket manually closed");
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchOnlineUsers();

    if (presenceSocket.current) return;

    presenceSocket.current = new WebSocket(
      `${import.meta.env.VITE_WS_BASE_URL}/presence/`
    );

    presenceSocket.current.onopen = () => {
      console.log("Presence connected");
    };

    presenceSocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "presence") {
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

    presenceSocket.current.onclose = () => {
      console.log("Presence disconnected");
      presenceSocket.current = null;
    };

    return () => {
      presenceSocket.current?.close();
      presenceSocket.current = null;
    };
  }, [user]);

  return (
    <PresenceContext.Provider value={{ onlineUsers, setOnlineUsers, disconnectPresence }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  return useContext(PresenceContext);
};