import strawberry
import strawberry.django as strawberry_django
from strawberry import auto

from .models import Channel, Message


@strawberry_django.type(Channel)
class ChannelType:
    id: auto
    name: auto
    channel_type: auto


@strawberry_django.type(Message)
class MessageType:
    id: auto
    content: auto
    created_at: auto


@strawberry.type
class Query:
    channels: list[ChannelType] = strawberry_django.field()
    messages: list[MessageType] = strawberry_django.field()


@strawberry.type
class Mutation:
    @strawberry.mutation
    def placeholder_chat(self) -> bool:
        return True
