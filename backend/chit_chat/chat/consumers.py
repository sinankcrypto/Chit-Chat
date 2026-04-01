import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message, ChatFile
from notification.utils.notification_utils import create_notification
from django.shortcuts import get_object_or_404
import logging

from chat.utils.presence import set_user_online, set_user_offline

logger = logging.getLogger(__name__)

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")

        if not self.user or not self.user.is_authenticated:
            logger.info("No user or user is not authenticated")
            await self.close()
            return

        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room = await database_sync_to_async(
            lambda: get_object_or_404(ChatRoom, id=self.room_id)
        )()
        self.room_group_name = f"chat_{self.room_id}"

        # Check if user belongs to room
        if not await self.user_in_room():
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )


    async def receive(self, text_data):
        data = json.loads(text_data)

        if data.get("type") == "read_messages":
            await self.mark_messages_read()
            return
        
        message = data.get("message")
        file_id = data.get("file_id")

        # determine message type
        if file_id and message:
            message_type = "mixed"
        elif file_id:
            message_type = "file"
        else:
            message_type = "text"

        saved_message = await self.save_message(message, message_type, file_id)

        participants = await database_sync_to_async(
            lambda: list(self.room.participants.exclude(id=self.user.id))
        )()

        for user in participants:
            notification = await database_sync_to_async(create_notification)(
                user,
                self.user,
                self.room,
                saved_message.content
            )
            
            await self.channel_layer.group_send(
                f"user_{user.id}",
                {
                    "type": "notification_event",
                    "notification_id": notification.id,
                    "sender": self.user.username,
                    "room_id": self.room.id,
                    "message": saved_message.content or "Attachment"
                }
            )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": saved_message.content,
                "message_type": saved_message.message_type,
                "file_url": saved_message.attachment.file.url if saved_message.attachment else None,
                "file_type": saved_message.attachment.file_type if saved_message.attachment else None,
                "sender": self.user.username,
                "sender_id": self.user.id,
                "timestamp": str(saved_message.timestamp),
            }
        )

    async def chat_message(self, event):
        is_me = event.get("sender_id") == self.user.id

        await self.send(text_data=json.dumps({
            "message": event["message"],
            "message_type": event["message_type"],
            "file_url": event["file_url"],
            "file_type": event.get("file_type"),
            "sender": event["sender"],
            "sender_id": event["sender_id"],
            "timestamp": event["timestamp"],
            "is_me": is_me,
        }))

    @database_sync_to_async
    def user_in_room(self):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            return room.participants.filter(id=self.user.id).exists()
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, message, message_type, file_id=None):
        attachment = None

        if file_id:
            attachment = ChatFile.objects.get(id=file_id)

        message = Message.objects.create(
            room_id=self.room_id,
            sender=self.user,
            content=message,
            message_type=message_type,
            attachment=attachment
        )

        message.read_by.add(self.user)
        return message
    
    @database_sync_to_async
    def mark_messages_read(self):
        room = ChatRoom.objects.get(id=self.room_id)

        unread_messages = room.messages.exclude(
            read_by=self.user,
        ).exclude(
            sender=self.user
        )

        for msg in unread_messages:
            msg.read_by.add(self.user)

    async def presence_event(self, event):

        await self.send(text_data=json.dumps({
            "type": "presence",
            "user_id": event["user_id"],
            "status": event["status"]
        }))

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        
        await self.accept()

        await self.channel_layer.group_add(
            "presence",
            self.channel_name
        )

        await database_sync_to_async(set_user_online)(self.user.id)
        logger.info(f"Added to online users: {self.user}")

        await self.channel_layer.group_send(
            "presence",
            {
                "type": "presence_event",
                "user_id": self.user.id,
                "status": "online"
            }
        )

    async def disconnect(self, code):
        if not self.user:
            return
        
        await database_sync_to_async(set_user_offline)(self.user.id)

        await self.channel_layer.group_send(
            "presence",
            {
                "type": "presence_event",
                "user_id": self.user.id,
                "status": "offline"
            }
        )

        await self.channel_layer.group_discard(
            "presence",
            self.channel_name
        )

    async def presence_event(self, event):
        await self.send(text_data=json.dumps({
            "type": "presence",
            "user_id": event["user_id"],
            "status": event["status"]
        }))

    async def notification_event(self, event):
        await self.send(text_data=json.dumps({
            "type": "notification",
            "notification_id": event["notification_id"],
            "sender": event["sender"],
            "room_id": event["room_id"],
            "message_id" : event["message_id"]
        }))