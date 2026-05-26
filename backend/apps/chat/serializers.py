from typing import Any

from rest_framework import serializers

from .models import Channel, Message


class MessageSerializer(serializers.ModelSerializer[Message]):
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    reaction_count = serializers.IntegerField(source="reactions.count", read_only=True)

    class Meta:
        model = Message
        fields = (
            "id",
            "channel",
            "author",
            "author_name",
            "content",
            "attachment",
            "reply_to",
            "edited_at",
            "created_at",
            "is_deleted",
            "reaction_count",
        )
        read_only_fields = ("author", "created_at", "edited_at")


class ChannelSerializer(serializers.ModelSerializer[Channel]):
    member_count = serializers.IntegerField(source="members.count", read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Channel
        fields = (
            "id",
            "name",
            "channel_type",
            "description",
            "school_class",
            "subject",
            "created_at",
            "member_count",
            "last_message",
        )

    def get_last_message(self, obj: Channel) -> dict[str, Any] | None:
        msg = obj.messages.filter(is_deleted=False).last()
        if msg:
            return {
                "content": msg.content[:100],
                "author": msg.author.full_name,
                "at": msg.created_at.isoformat(),
            }
        return None
