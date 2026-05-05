import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [rooms, setRooms] = useState([]);
    const { user } = useAuth();
    const { socketRef } = useSocket();

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

            if (data.type === "message_recieved") {
                const { room_id, message } = data;

                setRooms((prev) => 
                    prev.map((room) => {
                        if (room.id !== room_id) return room;

                        return {
                            ...room,
                            last_message: {
                                content: message.content,
                                timestamp: message.timestamp,
                                sender: message.sender
                            },
                            unread_count: (room.unread_count || 0) + 1
                        };
                    })
                );
            }

        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socketRef.current]);

    const updateRoomLocally = (updatedRoom) => {
        setRooms(prev => 
            prev.map(room => 
                room.id === updatedRoom.id?updatedRoom: room
            )
        );
    };

    return (
        <ChatContext.Provider value={{ rooms, setRooms, updateRoomLocally }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);