from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()
    room_id = serializers.IntegerField(source="room.id")

    class Meta:
        model = Notification
        fields = [
            "id",
            "sender",
            "room_id",
            "message",
            "notification_type",
            "is_read",
            "created_at",
        ]