from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer


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

        messages = room.messages.order_by("timestamp")
        serializer = MessageSerializer(messages, many=True)

        return Response(serializer.data)