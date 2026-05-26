from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.accounts.models import User, UserRole

# Mirrors frontend/e2e/fixtures.ts MOCK_USER so manual clickthrough hits the
# same shape the Playwright tests assume.
SEED_USERS = [
    {
        "email": "alice@school.edu",
        "username": "alice",
        "first_name": "Alice",
        "last_name": "Student",
        "role": UserRole.STUDENT,
        "password": "password",
        "is_superuser": False,
        "is_staff": False,
    },
    {
        "email": "admin@school.edu",
        "username": "admin",
        "first_name": "Admin",
        "last_name": "User",
        "role": UserRole.ADMIN,
        "password": "admin",
        "is_superuser": True,
        "is_staff": True,
    },
]


class Command(BaseCommand):
    help = (
        "Create default local-dev users (idempotent). Refuses to run when DEBUG=False."
    )

    def handle(self, *args: Any, **options: Any) -> None:
        if not settings.DEBUG:
            raise CommandError("seed_dev is only allowed with DEBUG=True")

        for spec in SEED_USERS:
            data = dict(spec)
            password = data.pop("password")
            email = data["email"]
            user, created = User.objects.get_or_create(email=email, defaults=data)
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f"created {email} / {password}"))
            else:
                self.stdout.write(f"exists  {email}")
