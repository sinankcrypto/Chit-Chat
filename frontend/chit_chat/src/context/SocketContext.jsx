import { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

const WS_URL = import.meta.env.VITE_WS_BASE_URL;

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const socket = new WebSocket(`${WS_URL}/presence/`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("Global socket connected")
        };

        socket.onclose = () => {
            console.log("Global socket disconnected");
            socketRef.current = null;
        };

        return () => {
            socket.close();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socketRef }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);