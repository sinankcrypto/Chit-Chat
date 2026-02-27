from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer

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
        
        messages = room.messages.order_by("timestamp")
        serializer = MessageSerializer(messages, many=True)

        return Response(serializer.data)
    
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