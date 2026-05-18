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
        
class ChatFile(models.Model):

    file_url = models.URLField()
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    file_type = models.CharField(max_length=100)
    file_name = models.CharField(max_length=255)
    size = models.IntegerField()

    public_id = models.CharField(max_length=255, blank=True, null=True)

class Message(models.Model):
    MESSAGE_TYPE_CHOICES = (
        ("text", "Text"),
        ("image","Image"),
        ("video","Video"),
        ("file","File"),
        ("mixed","Mixed"),
    )

    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    content = models.TextField(blank=True, null=True)
    message_type = models.CharField(
        max_length=10,
        choices=MESSAGE_TYPE_CHOICES,
        default="text"
    )
    attachment = models.ForeignKey(
        ChatFile,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    read_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="read_messages",
        blank=True
    )

    def __str__(self):
        return f"{self.sender} - {self.room.name}"
    