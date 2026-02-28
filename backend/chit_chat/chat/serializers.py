from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message

User = get_user_model()

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

class ChatRoomSerializer(serializers.ModelSerializer):
    participant_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True
    )
    # READ FIELD
    participants = ParticipantSerializer(
        many=True,
        read_only=True
    )
    display_name = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            "id",
            "room_type",
            "name",
            "display_name",
            "participant_ids",
            "participants",
            "last_message",
            "unread_count",
            "created_at"
        ]
        read_only_fields = ["created_at"]

    def validate(self, attrs):
        request = self.context["request"]
        room_type = attrs.get("room_type")
        participants = attrs.get("participant_ids",[])
    
        if room_type == "private":
            if len(participants) != 1:
                raise serializers.ValidationError(
                    "Private chat must have exactly 1 participant."
                )

        if room_type == "group":
            if len(participants) < 2:
                raise serializers.ValidationError(
                    "Group chat must have at least 2 participants."
                )
            if not attrs.get("name"):
                raise serializers.ValidationError(
                    "Group chat must have a name."
                )

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        participants = validated_data.pop("participant_ids")
        room_type = validated_data["room_type"]

        # PRIVATE CHAT LOGIC
        if room_type == "private":
            other_user = participants[0]

            existing_room = ChatRoom.objects.filter(
                room_type="private",
                participants=request.user
            ).filter(
                participants=other_user
            ).first()

            if existing_room:
                return existing_room

        room = ChatRoom.objects.create(
            created_by=request.user,
            **validated_data
        )

        room.participants.add(request.user)
        room.participants.add(*participants)

        return room
    
    def get_display_name(self, obj):
        request = self.context.get("request")

        if obj.room_type == "group":
            return obj.name

        # PRIVATE CHAT
        other_user = obj.participants.exclude(
            id=request.user.id
        ).first()

        return other_user.username if other_user else "Private Chat"

    def get_last_message(self, obj):
        message = obj.messages.order_by("-timestamp").first()
        if message:
            return {
                "content": message.content,
                "timestamp": message.timestamp,
                "sender": message.sender.username
            }
        return None

    def get_unread_count(self, obj):
        user = self.context["request"].user
        return obj.messages.exclude(
            read_by=user
        ).exclude(
            sender=user
        ).count()

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()

    class Meta:
        model = Message
        fields = ["id", "sender", "content", "timestamp", "read_by"]                      