import strawberry
import strawberry.django as strawberry_django
from strawberry import auto

from .models import Material


@strawberry_django.type(Material)
class MaterialType:
    id: auto
    title: auto
    material_type: auto
    created_at: auto


@strawberry.type
class Query:
    materials: list[MaterialType] = strawberry_django.field()


@strawberry.type
class Mutation:
    @strawberry.mutation
    def placeholder_materials(self) -> bool:
        return True
