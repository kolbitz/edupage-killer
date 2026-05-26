import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone

from apps.accounts.models import User

from .models import ChannelMembership, Message


class ChatConsumer(AsyncWebsocketConsumer):  # type: ignore[misc]
    async def connect(self) -> None:
        self.channel_id = self.scope["url_route"]["kwargs"]["channel_id"]
        self.room_group_name = f"chat_{self.channel_id}"
        user = self.scope["user"]

        if not user.is_authenticated:
            await self.close()
            return

        if not await self._is_member(user, self.channel_id):
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code: int) -> None:
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data: str) -> None:
        data = json.loads(text_data)
        msg_type = data.get("type", "message")

        if msg_type == "message":
            await self._handle_message(data)
        elif msg_type == "typing":
            await self._handle_typing(data)
        elif msg_type == "reaction":
            await self._handle_reaction(data)
        elif msg_type == "read":
            await self._handle_read()

    async def _handle_message(self, data: dict) -> None:  # type: ignore[type-arg]
        user = self.scope["user"]
        content = data.get("content", "").strip()
        reply_to_id = data.get("reply_to")

        if not content:
            return

        message = await self._save_message(user, content, reply_to_id)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "id": message.id,
                "content": message.content,
                "author_id": user.id,
                "author_name": user.full_name,
                "reply_to": reply_to_id,
                "created_at": message.created_at.isoformat(),
            },
        )

    async def _handle_typing(self, data: dict) -> None:  # type: ignore[type-arg]
        user = self.scope["user"]
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "typing_indicator",
                "user_id": user.id,
                "user_name": user.full_name,
                "is_typing": data.get("is_typing", False),
            },
        )

    async def _handle_reaction(self, data: dict) -> None:  # type: ignore[type-arg]
        user = self.scope["user"]
        message_id = data.get("message_id")
        emoji = data.get("emoji", "")
        if message_id and emoji:
            await self._save_reaction(user, message_id, emoji)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "message_reaction",
                    "message_id": message_id,
                    "user_id": user.id,
                    "emoji": emoji,
                },
            )

    async def _handle_read(self) -> None:
        user = self.scope["user"]
        await self._update_last_read(user, self.channel_id)

    async def chat_message(self, event: dict) -> None:  # type: ignore[type-arg]
        await self.send(text_data=json.dumps({"type": "message", **event}))

    async def typing_indicator(self, event: dict) -> None:  # type: ignore[type-arg]
        await self.send(text_data=json.dumps({"type": "typing", **event}))

    async def message_reaction(self, event: dict) -> None:  # type: ignore[type-arg]
        await self.send(text_data=json.dumps({"type": "reaction", **event}))

    @database_sync_to_async  # type: ignore[untyped-decorator]
    def _is_member(self, user: User, channel_id: int) -> bool:
        return ChannelMembership.objects.filter(
            channel_id=channel_id, user=user
        ).exists()

    @database_sync_to_async  # type: ignore[untyped-decorator]
    def _save_message(
        self, user: User, content: str, reply_to_id: int | None
    ) -> Message:
        return Message.objects.create(
            channel_id=self.channel_id,
            author=user,
            content=content,
            reply_to_id=reply_to_id,
        )

    @database_sync_to_async  # type: ignore[untyped-decorator]
    def _save_reaction(self, user: User, message_id: int, emoji: str) -> None:
        from .models import MessageReaction

        MessageReaction.objects.get_or_create(
            message_id=message_id, user=user, emoji=emoji
        )

    @database_sync_to_async  # type: ignore[untyped-decorator]
    def _update_last_read(self, user: User, channel_id: int) -> None:
        ChannelMembership.objects.filter(channel_id=channel_id, user=user).update(
            last_read_at=timezone.now()
        )
