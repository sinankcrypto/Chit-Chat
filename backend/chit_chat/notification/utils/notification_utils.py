from notification.models import Notification

def create_notification(user, sender, room, message):

    return Notification.objects.create(
        user=user,
        sender=sender,
        room=room,
        message=message,
        notification_type="message"
    )