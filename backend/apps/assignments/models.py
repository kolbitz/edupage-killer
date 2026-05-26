from django.db import models
from django.utils import timezone


class AssignmentType(models.TextChoices):
    HOMEWORK = "homework", "Homework"
    EXAM = "exam", "Exam"
    QUIZ = "quiz", "Quiz"
    PROJECT = "project", "Project"
    LAB = "lab", "Lab Report"


class Assignment(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assignment_type = models.CharField(max_length=20, choices=AssignmentType.choices)
    subject = models.ForeignKey(
        "timetable.Subject", on_delete=models.CASCADE, related_name="assignments"
    )
    school_class = models.ForeignKey(
        "accounts.SchoolClass", on_delete=models.CASCADE, related_name="assignments"
    )
    assigned_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="created_assignments",
        limit_choices_to={"role": "teacher"},
    )
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    max_score = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True
    )
    attachment = models.FileField(upload_to="assignments/%Y/%m/", null=True, blank=True)
    is_graded = models.BooleanField(default=False)
    edupage_id = models.CharField(max_length=100, blank=True, db_index=True)

    class Meta:
        ordering = ["due_date"]

    def __str__(self) -> str:
        return f"{self.title} ({self.subject})"

    @property
    def is_overdue(self) -> bool:
        return self.due_date < timezone.now()


class Submission(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUBMITTED = "submitted", "Submitted"
        LATE = "late", "Late"
        GRADED = "graded", "Graded"

    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="submissions"
    )
    student = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="submissions",
        limit_choices_to={"role": "student"},
    )
    file = models.FileField(upload_to="submissions/%Y/%m/", null=True, blank=True)
    text_content = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="graded_submissions",
    )
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("assignment", "student")
        ordering = ["-submitted_at"]

    def __str__(self) -> str:
        return f"{self.student} -> {self.assignment}"


class Grade(models.Model):
    student = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="grades"
    )
    subject = models.ForeignKey("timetable.Subject", on_delete=models.CASCADE)
    teacher = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="given_grades"
    )
    submission = models.OneToOneField(
        Submission,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="grade",
    )
    value = models.DecimalField(max_digits=5, decimal_places=2)
    max_value = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    label = models.CharField(max_length=10, blank=True)
    note = models.TextField(blank=True)
    date = models.DateField(default=timezone.now)
    is_final = models.BooleanField(default=False)
    edupage_id = models.CharField(max_length=100, blank=True, db_index=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self) -> str:
        return f"{self.student} - {self.subject}: {self.value}/{self.max_value}"
