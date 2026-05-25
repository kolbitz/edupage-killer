from django.db import models
from django.utils import timezone


class AttendanceStatus(models.TextChoices):
    PRESENT = "present", "Present"
    ABSENT = "absent", "Absent"
    LATE = "late", "Late"
    EXCUSED = "excused", "Excused"


class AttendanceRecord(models.Model):
    student = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="attendance_records",
        limit_choices_to={"role": "student"},
    )
    timetable_entry = models.ForeignKey(
        "timetable.TimetableEntry",
        on_delete=models.CASCADE,
        related_name="attendance_records",
        null=True,
        blank=True,
    )
    date = models.DateField(default=timezone.now)
    period = models.ForeignKey("timetable.Period", on_delete=models.SET_NULL, null=True)
    subject = models.ForeignKey(
        "timetable.Subject", on_delete=models.SET_NULL, null=True
    )
    status = models.CharField(max_length=20, choices=AttendanceStatus.choices)
    note = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="recorded_attendance",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    edupage_id = models.CharField(max_length=100, blank=True, db_index=True)

    class Meta:
        unique_together = ("student", "date", "period")
        ordering = ["-date", "period__number"]

    def __str__(self) -> str:
        return f"{self.student} - {self.date} - {self.status}"


class AbsenceJustification(models.Model):
    attendance_record = models.OneToOneField(
        AttendanceRecord, on_delete=models.CASCADE, related_name="justification"
    )
    reason = models.TextField()
    submitted_by = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_justifications",
    )
    approved = models.BooleanField(null=True)
    attachment = models.FileField(upload_to="justifications/", null=True, blank=True)

    def __str__(self) -> str:
        return f"Justification for {self.attendance_record}"
