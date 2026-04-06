import { useNotifications } from "../context/NotificationContext";

export const showPushNotification = ({ title, body, room_id }) => {
    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") return;

    console.log("push notification ready")

    const notification = new Notification(title, {
        body: body,
        icon: "/logo.png"
    });
    const { setSelectedChat } = useNotifications();

    notification.onclick = () => {
        window.focus();

        if (room_id) {
            window.location.href = `/chat`;
            setSelectedChat(room_id)
        } 
    };
};