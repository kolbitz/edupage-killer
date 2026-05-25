import strawberry
import strawberry.django as strawberry_django
from strawberry import auto

from .models import Assignment, Grade


@strawberry_django.type(Assignment)
class AssignmentType:
    id: auto
    title: auto
    assignment_type: auto
    due_date: auto


@strawberry_django.type(Grade)
class GradeType:
    id: auto
    value: auto
    max_value: auto
    date: auto


@strawberry.type
class Query:
    assignments: list[AssignmentType] = strawberry_django.field()
    grades: list[GradeType] = strawberry_django.field()


@strawberry.type
class Mutation:
    @strawberry.mutation
    def placeholder_assignments(self) -> bool:
        return True
