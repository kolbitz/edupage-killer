from typing import Any, cast

from django.db.models import QuerySet
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User

from .models import Channel, ChannelMembership, Message
from .serializers import ChannelSerializer, MessageSerializer


class ChannelListView(generics.ListCreateAPIView):  # type: ignore[type-arg]
    serializer_class = ChannelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Channel]:
        user = cast(User, self.request.user)
        return Channel.objects.filter(members=user, is_archived=False)

    def perform_create(self, serializer: Any) -> None:
        channel = serializer.save(created_by=self.request.user)
        ChannelMembership.objects.create(
            channel=channel, user=cast(User, self.request.user), is_admin=True
        )


class ChannelDetailView(generics.RetrieveUpdateAPIView):  # type: ignore[type-arg]
    serializer_class = ChannelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Channel]:
        user = cast(User, self.request.user)
        return Channel.objects.filter(members=user)


class MessageListView(generics.ListCreateAPIView):  # type: ignore[type-arg]
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Message]:
        channel_id = self.kwargs["channel_id"]
        user = cast(User, self.request.user)
        return (
            Message.objects.filter(
                channel_id=channel_id,
                channel__members=user,
                is_deleted=False,
            )
            .select_related("author")
            .order_by("created_at")
        )

    def perform_create(self, serializer: Any) -> None:
        serializer.save(author=self.request.user, channel_id=self.kwargs["channel_id"])


class JoinChannelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Any, channel_id: int) -> Any:
        channel = Channel.objects.get(pk=channel_id)
        ChannelMembership.objects.get_or_create(channel=channel, user=request.user)
        return Response({"joined": True}, status=status.HTTP_200_OK)
