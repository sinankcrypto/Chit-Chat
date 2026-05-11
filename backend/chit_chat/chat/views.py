from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import mimetypes

from .models import ChatRoom, Message, ChatFile
from .serializers import ChatRoomSerializer, MessageSerializer
from .pagination import MessageCursorPagination
from .utils.presence import get_online_users
import logging

User = get_user_model()

logger = logging.getLogger(__name__)

class ChatRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rooms = request.user.chat_rooms.all()
        serializer = ChatRoomSerializer(
            rooms,
            many=True,
            context={"user": request.user}
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = ChatRoomSerializer(
            data=request.data,
            context={"user": request.user}
        )
        serializer.is_valid(raise_exception=True)
        room = serializer.save()

        room_data = ChatRoomSerializer(
            room,
            context={"user": request.user}
        ).data

        channel_layer = get_channel_layer()

        is_existing = serializer.context.get("existing", False)

        if not is_existing:
            for user in room.participants.all():
                async_to_sync(channel_layer.group_send)(
                    f"user_{user.id}",
                    {
                        "type": "room_created_event",
                        "room": room_data
                    }
                )

        return Response(room_data, status=status.HTTP_201_CREATED)

class RoomMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)

        if not room.participants.filter(id=request.user.id).exists():
            return Response(
                {"error": "Not authorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        unread_messages = room.messages.exclude(
            read_by=request.user
        ).exclude(
            sender=request.user
        )

        first_unread = unread_messages.order_by("timestamp").first()

        request.user.read_messages.add(*unread_messages)
        
        messages = room.messages.order_by("-timestamp")

        paginator = MessageCursorPagination()
        paginated_messages = paginator.paginate_queryset(messages, request)

        serializer = MessageSerializer(
            paginated_messages,
            many=True,
            context={"request": request}
        )

        response = paginator.get_paginated_response(serializer.data)

        response.data["first_unread_id"] = first_unread.id if first_unread else None

        return response
    
class AddUsersToGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)

        if room.room_type != "group":
            return Response({"error": "Not a group chat"}, status=400)

        if room.created_by != request.user:
            return Response({"error": "Only creator can add users"}, status=403)

        user_ids = request.data.get("users", [])

        users_to_add = User.objects.filter(id__in=user_ids)

        room.participants.add(*users_to_add)

        return Response({"message": "Users added successfully"})
    
class RemoveUserFromGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)

        if room.room_type != "group":
            return Response({"error": "Not a group chat"}, status=400)

        if room.created_by != request.user:
            return Response({"error": "Only creator can remove users"}, status=403)

        user_id = request.data.get("user")

        user = get_object_or_404(User, id=user_id)

        room.participants.remove(user)

        return Response({"message": "User removed successfully"})
    
class UploadChatFileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)

        if not room.participants.filter(id=request.user.id).exists():
            return Response(
                {"error": "Not authorized"},
                status=status.HTTP_403_FORBIDDEN
            )
    
        file = request.FILES.get("file")

        if not file:
            return Response(
                {"error": "No file uploaded"},
                status=status.HTTP_400_BAD_REQUEST
            )

        file_type, _ = mimetypes.guess_type(file.name)

        if file_type and file_type.startswith("image"):
            file_category  = "image"
        elif file_type and file_type.startswith("video"):
            file_category  = "video"
        else:
            file_category  = "file"

        chat_file = ChatFile.objects.create(
            file=file,
            uploaded_by=request.user,
            file_type=file_category,
            size=file.size
        )

        return Response(
            {
                "file_id": chat_file.id,
                "file_url": chat_file.file.url,
                "file_type": chat_file.file_type,
            },
            status=status.HTTP_201_CREATED
        )

class OnlineUsersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        
        users = get_online_users()

        users = [int(u) for u in users]

        return Response({
            "online_users": users
        })
