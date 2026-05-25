from django.contrib import admin

from .models import Note


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ("title", "author", "subject", "visibility", "created_at")
    list_filter = ("visibility", "subject")
    search_fields = ("title", "content", "author__email")
