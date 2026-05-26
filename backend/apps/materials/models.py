from django.db import models


class MaterialType(models.TextChoices):
    HANDOUT = "handout", "Handout"
    PRESENTATION = "presentation", "Presentation"
    EXERCISE = "exercise", "Exercise"
    VIDEO = "video", "Video"
    LINK = "link", "Link"
    OTHER = "other", "Other"


class VisibilityType(models.TextChoices):
    CLASS = "class", "Whole Class"
    STUDENT = "student", "Specific Students"
    TEACHER = "teacher", "Teachers Only"
    PUBLIC = "public", "Public"


class Material(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    material_type = models.CharField(max_length=20, choices=MaterialType.choices)
    file = models.FileField(upload_to="materials/%Y/%m/", null=True, blank=True)
    url = models.URLField(blank=True)
    subject = models.ForeignKey(
        "timetable.Subject", on_delete=models.SET_NULL, null=True, blank=True
    )
    timetable_entry = models.ForeignKey(
        "timetable.TimetableEntry",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="materials",
    )
    school_class = models.ForeignKey(
        "accounts.SchoolClass",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="materials",
    )
    uploaded_by = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="uploaded_materials"
    )
    visibility = models.CharField(
        max_length=20, choices=VisibilityType.choices, default=VisibilityType.CLASS
    )
    shared_with = models.ManyToManyField(
        "accounts.User", related_name="shared_materials", blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    lesson_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class MaterialComment(models.Model):
    material = models.ForeignKey(
        Material, on_delete=models.CASCADE, related_name="comments"
    )
    author = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
