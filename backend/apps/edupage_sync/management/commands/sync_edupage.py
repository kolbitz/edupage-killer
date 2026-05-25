import argparse
from typing import Any

from django.core.management.base import BaseCommand

from apps.edupage_sync.models import EdupageSyncJob
from apps.edupage_sync.service import EdupageSyncService


class Command(BaseCommand):
    help = "Trigger a full EduPage sync"

    def add_arguments(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument(
            "--types", nargs="+", default=["timetable", "users", "grades", "homework"]
        )

    def handle(self, *args: Any, **options: Any) -> str | None:
        self.stdout.write("Starting EduPage sync...")
        job = EdupageSyncJob.objects.create(sync_types=options["types"])
        service = EdupageSyncService()
        results = service.sync_all(job_id=job.pk)
        self.stdout.write(self.style.SUCCESS(f"Sync complete: {results}"))
        return None
