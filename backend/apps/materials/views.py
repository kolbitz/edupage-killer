from typing import Any

from django.db.models import Q, QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions
from rest_framework.serializers import BaseSerializer

from .models import Material
from .serializers import MaterialCommentSerializer, MaterialSerializer


class MaterialListView(generics.ListCreateAPIView):  # type: ignore[type-arg]
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["subject", "school_class", "material_type", "lesson_date"]

    def get_queryset(self) -> QuerySet[Material]:
        user = self.request.user
        return (
            Material.objects.filter(
                Q(visibility="class", school_class__students__user=user)
                | Q(visibility="public")
                | Q(uploaded_by=user)
                | Q(shared_with=user)
            )
            .distinct()
            .order_by("-created_at")
        )

    def perform_create(self, serializer: BaseSerializer[Any]) -> None:
        serializer.save(uploaded_by=self.request.user)


class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):  # type: ignore[type-arg]
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Material]:
        return Material.objects.all()


class MaterialCommentView(generics.CreateAPIView):  # type: ignore[type-arg]
    serializer_class = MaterialCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer: BaseSerializer[Any]) -> None:
        serializer.save(
            author=self.request.user,
            material_id=self.kwargs["material_id"],
        )
