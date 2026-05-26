import strawberry
import strawberry.django as strawberry_django
from strawberry import auto

from .models import SchoolClass, User


@strawberry_django.type(User)
class UserType:
    id: auto
    email: auto
    first_name: auto
    last_name: auto
    role: auto
    full_name: str


@strawberry_django.type(SchoolClass)
class SchoolClassType:
    id: auto
    name: auto
    grade: auto
    section: auto
    year: auto


@strawberry.type
class Query:
    users: list[UserType] = strawberry_django.field()
    classes: list[SchoolClassType] = strawberry_django.field()

    @strawberry_django.field
    def me(self, info: strawberry.types.Info) -> UserType | None:
        user = info.context.request.user
        return user if user.is_authenticated else None


@strawberry.type
class Mutation:
    @strawberry.mutation
    def placeholder_accounts(self) -> bool:
        return True
