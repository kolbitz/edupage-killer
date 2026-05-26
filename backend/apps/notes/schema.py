import strawberry
import strawberry.django as strawberry_django
from strawberry import auto

from .models import Note


@strawberry_django.type(Note)
class NoteType:
    id: auto
    title: auto
    content: auto
    visibility: auto
    created_at: auto


@strawberry.type
class Query:
    notes: list[NoteType] = strawberry_django.field()


@strawberry.type
class Mutation:
    @strawberry.mutation
    def placeholder_notes(self) -> bool:
        return True
