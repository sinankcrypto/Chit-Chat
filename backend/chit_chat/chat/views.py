from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
import mimetypes

from .models import ChatRoom, Message, ChatFile
from .serializers import ChatRoomSerializer, MessageSerializer
from .pagination import MessageCursorPagination
from .utils.presence import get_online_users

User = get_user_model()


class ChatRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rooms = request.user.chat_rooms.all()
        serializer = ChatRoomSerializer(
            rooms,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = ChatRoomSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        room = serializer.save()

        return Response(
            ChatRoomSerializer(
                room,
                context={"request": request}
            ).data,
            status=status.HTTP_201_CREATED
        )

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

        request.user.read_messages.add(*unread_messages)
        
        messages = room.messages.order_by("-timestamp")

        paginator = MessageCursorPagination()
        paginated_messages = paginator.paginate_queryset(messages, request)

        serializer = MessageSerializer(
            paginated_messages,
            many=True,
            context={"request": request}
        )

        return paginator.get_paginated_response(serializer.data)
    
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
