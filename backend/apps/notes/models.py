from django.db import models


class NoteVisibility(models.TextChoices):
    PRIVATE = "private", "Private"
    CLASS = "class", "Whole Class"
    SCHOOL = "school", "Whole School"


class Note(models.Model):
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    author = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="notes"
    )
    subject = models.ForeignKey(
        "timetable.Subject", on_delete=models.SET_NULL, null=True, blank=True
    )
    timetable_entry = models.ForeignKey(
        "timetable.TimetableEntry", on_delete=models.SET_NULL, null=True, blank=True
    )
    lesson_date = models.DateField(null=True, blank=True)
    visibility = models.CharField(
        max_length=20, choices=NoteVisibility.choices, default=NoteVisibility.PRIVATE
    )
    school_class = models.ForeignKey(
        "accounts.SchoolClass", on_delete=models.SET_NULL, null=True, blank=True
    )
    shared_with = models.ManyToManyField(
        "accounts.User", related_name="shared_notes", blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return self.title or f"Note by {self.author} ({self.created_at:%Y-%m-%d})"
