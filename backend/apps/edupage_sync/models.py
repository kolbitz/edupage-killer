from django.db import models
from django.utils import timezone


class SyncStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    RUNNING = "running", "Running"
    SUCCESS = "success", "Success"
    FAILED = "failed", "Failed"
    PARTIAL = "partial", "Partial"


class EdupageSyncJob(models.Model):
    started_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=SyncStatus.choices, default=SyncStatus.PENDING
    )
    triggered_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True
    )
    sync_types = models.JSONField(default=list)
    result_summary = models.JSONField(default=dict)
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self) -> str:
        return f"Sync {self.started_at:%Y-%m-%d %H:%M} ({self.status})"


class EdupageSyncLog(models.Model):
    job = models.ForeignKey(
        EdupageSyncJob, on_delete=models.CASCADE, related_name="logs"
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    level = models.CharField(max_length=10, default="INFO")
    message = models.TextField()
    data = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["timestamp"]


class EdupageCredential(models.Model):
    """Per-user EduPage credentials for syncing their personal data."""

    user = models.OneToOneField(
        "accounts.User", on_delete=models.CASCADE, related_name="edupage_credential"
    )
    server = models.CharField(max_length=200)
    username = models.CharField(max_length=200)
    # Password is stored encrypted — use the service layer, never access directly
    encrypted_password = models.TextField()
    is_active = models.BooleanField(default=True)
    last_verified = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return f"EduPage creds for {self.user}"
