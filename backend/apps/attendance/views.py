from typing import Any, cast

from django.db.models import QuerySet
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions
from rest_framework.serializers import BaseSerializer

from apps.accounts.models import User

from .models import AttendanceRecord
from .serializers import AbsenceJustificationSerializer, AttendanceRecordSerializer


class AttendanceRecordListView(generics.ListCreateAPIView):  # type: ignore[type-arg]
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["student", "date", "subject", "status"]

    def get_queryset(self) -> QuerySet[AttendanceRecord]:
        return AttendanceRecord.objects.select_related(
            "student", "subject", "period"
        ).all()

    def perform_create(self, serializer: BaseSerializer[Any]) -> None:
        serializer.save(recorded_by=self.request.user)


class MyAttendanceView(generics.ListAPIView):  # type: ignore[type-arg]
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[AttendanceRecord]:
        user = cast(User, self.request.user)
        return AttendanceRecord.objects.filter(student=user).order_by("-date")


class ClassAttendanceTodayView(generics.ListAPIView):  # type: ignore[type-arg]
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[AttendanceRecord]:
        class_id = self.kwargs["class_id"]
        return AttendanceRecord.objects.filter(
            timetable_entry__school_class_id=class_id,
            date=timezone.now().date(),
        ).select_related("student", "subject", "period")


class AbsenceJustificationView(generics.CreateAPIView):  # type: ignore[type-arg]
    serializer_class = AbsenceJustificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer: BaseSerializer[Any]) -> None:
        serializer.save(submitted_by=self.request.user)
