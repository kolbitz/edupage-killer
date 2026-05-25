from django.contrib import admin

from .models import EdupageCredential, EdupageSyncJob, EdupageSyncLog


@admin.register(EdupageSyncJob)
class SyncJobAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ("started_at", "finished_at", "status", "triggered_by")
    list_filter = ("status",)
    readonly_fields = ("result_summary", "error_message")


admin.site.register(EdupageSyncLog)
admin.site.register(EdupageCredential)
