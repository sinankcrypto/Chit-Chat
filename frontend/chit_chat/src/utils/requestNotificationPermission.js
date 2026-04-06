export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.log("Browser does not support notifications");
        return;
    }

    if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
    }

};  