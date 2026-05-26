from django.contrib import admin

from .models import AbsenceJustification, AttendanceRecord


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ("student", "date", "period", "subject", "status")
    list_filter = ("status", "date", "subject")
    search_fields = ("student__email", "student__first_name", "student__last_name")


admin.site.register(AbsenceJustification)
