import logging
from typing import Any

from celery import shared_task
from django.utils import timezone

from .models import EdupageSyncJob, SyncStatus
from .service import EdupageSyncService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)  # type: ignore[untyped-decorator]
def run_edupage_sync(self: Any, job_id: int) -> dict[str, Any]:
    job = EdupageSyncJob.objects.get(pk=job_id)
    job.status = SyncStatus.RUNNING
    job.save()

    try:
        service = EdupageSyncService()
        results = service.sync_all(job_id=job_id)

        job.status = SyncStatus.SUCCESS
        job.result_summary = results
        job.finished_at = timezone.now()
        job.save()
        return results

    except Exception as exc:
        logger.error("EduPage sync job %d failed: %s", job_id, exc)
        job.status = SyncStatus.FAILED
        job.error_message = str(exc)
        job.finished_at = timezone.now()
        job.save()
        raise self.retry(exc=exc, countdown=60) from exc


@shared_task  # type: ignore[untyped-decorator]
def scheduled_edupage_sync() -> None:
    """Called by celery-beat on a schedule."""
    job = EdupageSyncJob.objects.create(
        sync_types=["timetable", "users", "grades", "homework"]
    )
    run_edupage_sync.delay(job.pk)
