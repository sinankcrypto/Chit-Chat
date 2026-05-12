import { createContext, useContext, useEffect, useState, useRef } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useTabVisibility } from "../hooks/useTabVisibility";
import { showPushNotification } from "../utils/showPushNotification";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import { useChat } from "./ChatContext";
import { useNavigate } from "react-router-dom"

const NotificationContext = createContext();

const WS_URL = import.meta.env.VITE_WS_BASE_URL;

export const NotificationProvider = ({ children }) => {

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { rooms, selectedChat, selectedChatRef, openChat } =  useChat();

  
  const isTabVisible = useTabVisibility();
  const visibilityRef = useRef(isTabVisible)

  const {user} = useAuth();
  const { socketRef } = useSocket();

  const navigate = useNavigate();

  useEffect(() => {
    console.log("React visibility state:", isTabVisible);
    visibilityRef.current = isTabVisible;
  }, [isTabVisible]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "notification") {
        const currentChat = selectedChatRef.current;

        if (visibilityRef.current) {
          if (!currentChat || currentChat.id !== data.room_id) {
            toast(`${data.sender}: ${data.message}`, {
              icon: "💬",
            });
            setUnreadCount(prev => prev + 1);
          }
        } else {
          const room = rooms.find(r => r.id === data.room_id);
          showPushNotification({
            title: data.sender,
            body: data.message,
            onClick: () => {
              navigate("/chat");
              openChat(room)
            },
          });

          setUnreadCount(prev => prev + 1);
        }

        setNotifications(prev => [
          {
            id: data.notification_id,
            sender: data.sender,
            room_id: data.room_id,
            message: data.message
          },
          ...prev
        ]);
      }

      if (data.type === "room_created") {
        console.log("New room recieved:", data.room);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socketRef.current]);

  useEffect(() => {

    const fetchUnread = async () => {
      try{
        const res = await API.get("/notifications/unread/")
        setNotifications(res.data.results)
      } catch (err) {
        console.log(err);
      }
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await API.get("/notifications/unread-count/");
        setUnreadCount(res.data.unread_count);
      } catch (err) {
        console.log(err);
      }
    };

    if (user){
      fetchUnread();
      fetchUnreadCount();
    }

  }, [user]);

  const markRead = async (id) => {
    try {
      await API.post(`/notifications/${id}/mark-read/`);

      setNotifications(prev =>
        prev.filter(n => n.id !== id)
      );

      setUnreadCount(prev => Math.max(prev - 1, 0));

    } catch (err) {
      console.log(err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.post("/notifications/mark-all-read/");
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markRead,
        markAllRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);