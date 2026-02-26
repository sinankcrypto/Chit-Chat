from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message

User = get_user_model()


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True
    )

    class Meta:
        model = ChatRoom
        fields = ["id", "name", "participants", "created_at"]
        read_only_fields = ["created_at"]

    def create(self, validated_data):
        participants = validated_data.pop("participants")
        room = ChatRoom.objects.create(**validated_data)
        room.participants.set(participants)
        return room

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()

    class Meta:
        model = Message
        fields = ["id", "sender", "content", "timestamp"]                      