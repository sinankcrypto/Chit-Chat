import { useNotifications } from "../context/NotificationContext";

export const showPushNotification = ({ title, body, onclick }) => {
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

        if (onClick) {
            onClick();
        }
    };
};