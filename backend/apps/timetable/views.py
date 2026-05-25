from typing import cast

from django.db.models import QuerySet
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions

from apps.accounts.models import User

from .models import Period, Room, Subject, SubstitutionEntry, TimetableEntry
from .serializers import (
    PeriodSerializer,
    RoomSerializer,
    SubjectSerializer,
    SubstitutionEntrySerializer,
    TimetableEntrySerializer,
)


class SubjectListView(generics.ListCreateAPIView):  # type: ignore[type-arg]
    queryset = Subject.objects.all().order_by("name")
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]


class RoomListView(generics.ListCreateAPIView):  # type: ignore[type-arg]
    queryset = Room.objects.all().order_by("name")
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]


class PeriodListView(generics.ListCreateAPIView):  # type: ignore[type-arg]
    queryset = Period.objects.all()
    serializer_class = PeriodSerializer
    permission_classes = [permissions.IsAuthenticated]


class TimetableEntryListView(generics.ListCreateAPIView):  # type: ignore[type-arg]
    serializer_class = TimetableEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["school_class", "teacher", "day", "subject"]

    def get_queryset(self) -> QuerySet[TimetableEntry]:
        return TimetableEntry.objects.select_related(
            "subject", "teacher", "room", "period", "school_class"
        ).all()


class MyTimetableView(generics.ListAPIView):  # type: ignore[type-arg]
    serializer_class = TimetableEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[TimetableEntry]:
        user = cast(User, self.request.user)
        if hasattr(user, "student_profile") and user.student_profile.school_class:
            return TimetableEntry.objects.select_related(
                "subject", "teacher", "room", "period"
            ).filter(school_class=user.student_profile.school_class)
        elif hasattr(user, "teacher_profile"):
            return TimetableEntry.objects.select_related(
                "subject", "teacher", "room", "period"
            ).filter(teacher=user)
        return TimetableEntry.objects.none()


class SubstitutionListView(generics.ListCreateAPIView):  # type: ignore[type-arg]
    serializer_class = SubstitutionEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["date", "school_class"]

    def get_queryset(self) -> QuerySet[SubstitutionEntry]:
        return SubstitutionEntry.objects.filter(
            date__gte=timezone.now().date()
        ).order_by("date")
