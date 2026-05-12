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
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            "id",
            "room_type",
            "name",
            "participant_ids",
            "participants",
            "last_message",
            "unread_count",
            "created_at"
        ]
        read_only_fields = ["created_at"]

    def validate(self, attrs):
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
        user = self.context.get("user")
        participants = validated_data.pop("participant_ids")
        room_type = validated_data["room_type"]

        # PRIVATE CHAT LOGIC
        if room_type == "private":
            other_user = participants[0]

            existing_room = ChatRoom.objects.filter(
                room_type="private",
                participants=user
            ).filter(
                participants=other_user
            ).first()

            if existing_room:
                self.context["existing"] = True
                return existing_room

        room = ChatRoom.objects.create(
            created_by=user,
            **validated_data
        )

        room.participants.add(user)
        room.participants.add(*participants)

        return room

    def get_last_message(self, obj):
        message = obj.messages.order_by("-timestamp").first()
        if message:
            return {
                "content": message.content,
                "timestamp": message.timestamp.isoformat(),
                "sender": message.sender.username
            }
        return None

    def get_unread_count(self, obj):
        user = self.context.get("user")
        return obj.messages.exclude(
            read_by=user
        ).exclude(
            sender=user
        ).count()

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()
    file_url = serializers.SerializerMethodField()
    file_type = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "content",
            "message_type",
            "file_url",
            "attachment",
            "file_type",
            "read_by",
            "timestamp"
        ]

    def get_file_url(self, obj):
        if obj.attachment and obj.attachment.file:
            url = obj.attachment.file.url

            return url

        return None     

    def get_file_type(self, obj):
        if obj.attachment and obj.attachment.file:
            file_type = obj.attachment.file_type

            return file_type

        return None     