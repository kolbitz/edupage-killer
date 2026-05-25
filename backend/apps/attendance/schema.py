import strawberry
import strawberry.django as strawberry_django
from strawberry import auto

from .models import AttendanceRecord


@strawberry_django.type(AttendanceRecord)
class AttendanceRecordType:
    id: auto
    date: auto
    status: auto


@strawberry.type
class Query:
    attendance_records: list[AttendanceRecordType] = strawberry_django.field()


@strawberry.type
class Mutation:
    @strawberry.mutation
    def placeholder_attendance(self) -> bool:
        return True
