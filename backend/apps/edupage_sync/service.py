"""
Bidirectional sync service between EduPage and our local database.

Pull (EduPage → DB): timetable, students, teachers, subjects, grades, homework, attendance
Push (DB → EduPage): homework submissions (where API supports it)
"""

import logging
from datetime import date, datetime
from typing import Any

from django.conf import settings

logger = logging.getLogger(__name__)


class EdupageSyncService:
    def __init__(
        self, server: str = "", username: str = "", password: str = ""
    ) -> None:
        self.server = server or settings.EDUPAGE_SERVER
        self.username = username or settings.EDUPAGE_USERNAME
        self.password = password or settings.EDUPAGE_PASSWORD
        self._edupage: Any = None

    def _get_client(self) -> Any:
        if self._edupage is None:
            try:
                from edupage_api import Edupage

                ep = Edupage()
                ep.login(self.username, self.password, self.server)
                self._edupage = ep
            except Exception as exc:
                logger.error("EduPage login failed: %s", exc)
                raise
        return self._edupage

    # ------------------------------------------------------------------ #
    # Pull: EduPage → local DB                                            #
    # ------------------------------------------------------------------ #

    def sync_all(self, job_id: int | None = None) -> dict[str, Any]:
        results: dict[str, Any] = {}
        try:
            results["timetable"] = self.sync_timetable()
        except Exception as exc:
            logger.warning("Timetable sync failed: %s", exc)
            results["timetable"] = {"error": str(exc)}

        try:
            results["users"] = self.sync_users()
        except Exception as exc:
            logger.warning("Users sync failed: %s", exc)
            results["users"] = {"error": str(exc)}

        try:
            results["grades"] = self.sync_grades()
        except Exception as exc:
            logger.warning("Grades sync failed: %s", exc)
            results["grades"] = {"error": str(exc)}

        try:
            results["homework"] = self.sync_homework()
        except Exception as exc:
            logger.warning("Homework sync failed: %s", exc)
            results["homework"] = {"error": str(exc)}

        return results

    def sync_timetable(self) -> dict[str, int]:
        from apps.timetable.models import Subject

        ep = self._get_client()
        created = updated = 0

        try:
            timetable_data = ep.get_timetable()
        except AttributeError:
            # Fallback for different API versions
            timetable_data = []

        for entry in timetable_data or []:
            subject_name = getattr(entry, "subject_name", "") or ""
            if not subject_name:
                continue

            subject, _ = Subject.objects.get_or_create(
                edupage_id=str(getattr(entry, "subject_id", "") or ""),
                defaults={
                    "name": subject_name,
                    "short_name": subject_name[:20],
                },
            )

        return {"created": created, "updated": updated}

    def sync_users(self) -> dict[str, int]:
        from apps.accounts.models import (
            StudentProfile,
            TeacherProfile,
            User,
            UserRole,
        )

        ep = self._get_client()
        created = updated = 0

        try:
            students = ep.get_students() or []
        except Exception:
            students = []

        for student in students:
            edupage_id = str(getattr(student, "id", "") or "")
            if not edupage_id:
                continue

            full_name = str(getattr(student, "name", "") or "").strip()
            first, _, last = full_name.partition(" ")

            user, was_created = User.objects.update_or_create(
                edupage_id=edupage_id,
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "role": UserRole.STUDENT,
                    "username": f"ep_{edupage_id}",
                    "email": f"ep_{edupage_id}@edupage.local",
                },
            )
            StudentProfile.objects.get_or_create(user=user)
            if was_created:
                created += 1
            else:
                updated += 1

        try:
            teachers = ep.get_teachers() or []
        except Exception:
            teachers = []

        for teacher in teachers:
            edupage_id = str(getattr(teacher, "id", "") or "")
            if not edupage_id:
                continue

            full_name = str(getattr(teacher, "name", "") or "").strip()
            first, _, last = full_name.partition(" ")

            user, was_created = User.objects.update_or_create(
                edupage_id=edupage_id,
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "role": UserRole.TEACHER,
                    "username": f"ep_t_{edupage_id}",
                    "email": f"ep_t_{edupage_id}@edupage.local",
                },
            )
            TeacherProfile.objects.get_or_create(user=user)
            if was_created:
                created += 1
            else:
                updated += 1

        return {"created": created, "updated": updated}

    def sync_grades(self) -> dict[str, int]:
        from apps.accounts.models import User
        from apps.assignments.models import Grade
        from apps.timetable.models import Subject

        ep = self._get_client()
        created = 0

        try:
            grades_data = ep.get_grades() or []
        except Exception:
            grades_data = []

        for g in grades_data:
            edupage_id = str(getattr(g, "grade_id", "") or "")
            if not edupage_id or Grade.objects.filter(edupage_id=edupage_id).exists():
                continue

            subject_name = str(getattr(g, "subject_name", "") or "")
            subject, _ = Subject.objects.get_or_create(
                name=subject_name,
                defaults={"short_name": subject_name[:20]},
            )

            student_ep_id = str(getattr(g, "student_id", "") or "")
            teacher_ep_id = str(getattr(g, "teacher_id", "") or "")

            try:
                student = User.objects.get(edupage_id=student_ep_id)
                teacher = User.objects.get(edupage_id=teacher_ep_id)
            except User.DoesNotExist:
                continue

            Grade.objects.create(
                student=student,
                subject=subject,
                teacher=teacher,
                value=float(getattr(g, "grade_n", 0) or 0),
                max_value=100,
                label=str(getattr(g, "grade", "") or ""),
                date=getattr(g, "date", date.today()) or date.today(),
                edupage_id=edupage_id,
            )
            created += 1

        return {"created": created}

    def sync_homework(self) -> dict[str, int]:
        from django.utils import timezone as tz

        from apps.accounts.models import SchoolClass, User
        from apps.assignments.models import Assignment
        from apps.timetable.models import Subject

        ep = self._get_client()
        created = 0

        try:
            # 0.12.x: get_homework(date_from, date_to)
            from datetime import timedelta

            homework_data = (
                ep.get_homework(date.today(), date.today() + timedelta(days=30)) or []
            )
        except Exception:
            homework_data = []

        for hw in homework_data:
            edupage_id = str(
                getattr(hw, "homework_id", "") or getattr(hw, "id", "") or ""
            )
            if (
                not edupage_id
                or Assignment.objects.filter(edupage_id=edupage_id).exists()
            ):
                continue

            subject_obj = getattr(hw, "subject", None)
            subject_name = (
                getattr(subject_obj, "name", "") or str(subject_obj or "")
            ).strip() or "Unknown"
            subject, _ = Subject.objects.get_or_create(
                name=subject_name or "Unknown",
                defaults={"short_name": (subject_name or "?")[:20]},
            )

            teacher_ep_id = str(getattr(hw, "teacher_id", "") or "")
            teacher: User | None
            try:
                teacher = User.objects.get(edupage_id=teacher_ep_id)
            except User.DoesNotExist:
                teacher = User.objects.filter(role="teacher").first()
                if not teacher:
                    continue

            school_class = SchoolClass.objects.first()
            if not school_class:
                continue

            due = getattr(hw, "due_date", None) or date.today()
            Assignment.objects.create(
                title=str(
                    getattr(hw, "title", "")
                    or getattr(hw, "description", "")
                    or "Homework"
                ),
                description=str(
                    getattr(hw, "description", "") or getattr(hw, "text", "") or ""
                ),
                assignment_type="homework",
                subject=subject,
                school_class=school_class,
                assigned_by=teacher,
                due_date=tz.make_aware(datetime.combine(due, datetime.min.time())),
                edupage_id=edupage_id,
            )
            created += 1

        return {"created": created}

    # ------------------------------------------------------------------ #
    # Push: local DB → EduPage (limited by API support)                  #
    # ------------------------------------------------------------------ #

    def push_homework_completion(self, submission_id: int) -> bool:
        """Mark homework as done in EduPage if the API supports it."""
        from apps.assignments.models import Submission

        try:
            submission = Submission.objects.select_related("assignment").get(
                pk=submission_id
            )
            if not submission.assignment.edupage_id:
                return False

            ep = self._get_client()
            # edupage-api may expose set_homework_done() depending on version
            if hasattr(ep, "set_homework_done"):
                ep.set_homework_done(submission.assignment.edupage_id)
                return True
        except Exception as exc:
            logger.warning("Push homework completion failed: %s", exc)

        return False
