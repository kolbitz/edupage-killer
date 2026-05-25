from django.db.models import QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions

from .models import SchoolClass, StudentProfile, TeacherProfile, User
from .serializers import (
    SchoolClassSerializer,
    StudentProfileSerializer,
    TeacherProfileSerializer,
    UserListSerializer,
)


class UserListView(generics.ListAPIView):  # type: ignore[type-arg]
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["role"]
    search_fields = ["email", "first_name", "last_name"]

    def get_queryset(self) -> QuerySet[User]:
        return User.objects.all().order_by("last_name", "first_name")


class SchoolClassListView(generics.ListCreateAPIView):  # type: ignore[type-arg]
    queryset = SchoolClass.objects.all().order_by("grade", "section")
    serializer_class = SchoolClassSerializer
    permission_classes = [permissions.IsAuthenticated]


class SchoolClassDetailView(generics.RetrieveUpdateDestroyAPIView):  # type: ignore[type-arg]
    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassSerializer
    permission_classes = [permissions.IsAuthenticated]


class StudentProfileListView(generics.ListAPIView):  # type: ignore[type-arg]
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["school_class"]

    def get_queryset(self) -> QuerySet[StudentProfile]:
        return StudentProfile.objects.select_related("user", "school_class").all()


class TeacherProfileListView(generics.ListAPIView):  # type: ignore[type-arg]
    queryset = TeacherProfile.objects.select_related("user").all()
    serializer_class = TeacherProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class CurrentUserView(generics.RetrieveUpdateAPIView):  # type: ignore[type-arg]
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self) -> User:
        return self.request.user  # type: ignore[return-value]
