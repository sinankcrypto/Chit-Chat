from django.db import models
from django.db import models
from django.conf import settings
from rest_framework.serializers import ValidationError


class ChatRoom(models.Model):
    ROOM_TYPE_CHOICES = (
        ("private", "Private"),
        ("group", "Group"),
    )

    room_type = models.CharField(
        max_length=10,
        choices=ROOM_TYPE_CHOICES
    )

    name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="chat_rooms"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_rooms"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.room_type == "private":
            return f"Private Chat {self.id}"
        return self.name or f"Group {self.id}"
    
    def clean(self):
        if self.room_type == "group" and not self.name:
            raise ValidationError("Group chats must have a name.")


class Message(models.Model):
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.email} - {self.room.name}"