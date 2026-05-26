from django.contrib import admin

from .models import Assignment, Grade, Submission


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = (
        "title",
        "assignment_type",
        "subject",
        "school_class",
        "due_date",
        "assigned_by",
    )
    list_filter = ("assignment_type", "is_graded", "subject")
    search_fields = ("title",)


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ("student", "assignment", "status", "submitted_at", "score")
    list_filter = ("status",)


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ("student", "subject", "value", "max_value", "date", "is_final")
    list_filter = ("subject", "is_final")
