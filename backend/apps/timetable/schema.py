import strawberry
import strawberry.django as strawberry_django
from strawberry import auto

from .models import Subject, TimetableEntry


@strawberry_django.type(Subject)
class SubjectType:
    id: auto
    name: auto
    short_name: auto
    color: auto


@strawberry_django.type(TimetableEntry)
class TimetableEntryType:
    id: auto
    day: auto
    week_type: auto


@strawberry.type
class Query:
    subjects: list[SubjectType] = strawberry_django.field()
    timetable_entries: list[TimetableEntryType] = strawberry_django.field()


@strawberry.type
class Mutation:
    @strawberry.mutation
    def placeholder_timetable(self) -> bool:
        return True
