from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import ParentProfile, SchoolClass, StudentProfile, TeacherProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):  # type: ignore[type-arg]
    list_display = ("email", "full_name", "role", "is_active")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    fieldsets = BaseUserAdmin.fieldsets + (  # type: ignore[operator]
        ("Role & Profile", {"fields": ("role", "avatar", "phone", "edupage_id")}),
    )


@admin.register(SchoolClass)
class SchoolClassAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ("name", "grade", "section", "year")
    list_filter = ("year", "grade")


admin.site.register(StudentProfile)
admin.site.register(TeacherProfile)
admin.site.register(ParentProfile)
