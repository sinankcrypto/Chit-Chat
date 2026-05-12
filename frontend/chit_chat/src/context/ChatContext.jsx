import { createContext, useContext, useEffect, useRef, useState } from "react";
import API from "../services/api";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [rooms, setRooms] = useState([]);
    const { user } = useAuth();
    const { socketRef } = useSocket();

    const [selectedChat, setSelectedChat] = useState(null);
    const selectedChatRef = useRef(null);

    const openChat = (room) => {
        setSelectedChat(room);

        setRooms(prev => 
            prev.map(r => 
                r.id === room.id? {...r, unread_count:0}: r
            )
        );
    };

    const closeChat = () => {
        setSelectedChat(null);
    };

    const updateRoomLocally = (updatedRoom) => {
        setRooms(prev => 
            prev.map(room => 
                room.id === updatedRoom.id?updatedRoom: room
            )
        );
    };

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await API.get("/chat/rooms/");
                setRooms(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        if (user) {
            fetchRooms();
        }
    }, [user]);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat])

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "room_created") {
                const newRoom = data.room;

                setRooms((prev) => {
                    const exists = prev.some( r => r.id === newRoom.id);
                    if (exists) return prev;

                    return [newRoom, ...prev];
                });
            }

            if (data.type === "room_updated") {
                setRooms(prev =>
                    prev.map(room =>
                    room.id === data.room.id
                        ? data.room
                        : room
                    )
                );
            }

        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socketRef.current]);

    return (
        <ChatContext.Provider 
            value={{ rooms, setRooms, updateRoomLocally, selectedChat, selectedChatRef, openChat, closeChat }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);