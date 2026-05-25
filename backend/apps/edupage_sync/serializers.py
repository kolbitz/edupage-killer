from rest_framework import serializers

from .models import EdupageSyncJob, EdupageSyncLog


class EdupageSyncLogSerializer(serializers.ModelSerializer[EdupageSyncLog]):
    class Meta:
        model = EdupageSyncLog
        fields = ("id", "timestamp", "level", "message")


class EdupageSyncJobSerializer(serializers.ModelSerializer[EdupageSyncJob]):
    logs = EdupageSyncLogSerializer(many=True, read_only=True)

    class Meta:
        model = EdupageSyncJob
        fields = (
            "id",
            "started_at",
            "finished_at",
            "status",
            "triggered_by",
            "sync_types",
            "result_summary",
            "error_message",
            "logs",
        )
