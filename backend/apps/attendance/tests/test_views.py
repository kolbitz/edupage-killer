import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import SchoolClass, StudentProfile, TeacherProfile, User
from apps.attendance.models import AttendanceRecord
from apps.timetable.models import Period, Subject


@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.fixture
def period(db: None) -> Period:
    return Period.objects.create(number=1, start_time="08:00", end_time="08:45")


@pytest.fixture
def subject(db: None) -> Subject:
    return Subject.objects.create(name="Math", short_name="MAT")


@pytest.fixture
def school_class(db: None) -> SchoolClass:
    return SchoolClass.objects.create(name="1A", grade=1, year=2024)


@pytest.fixture
def student(db: None, school_class: SchoolClass) -> User:
    user = User.objects.create_user(
        username="student1", email="student@test.com", password="pass", role="student"
    )
    StudentProfile.objects.create(user=user, school_class=school_class)
    return user


@pytest.fixture
def teacher(db: None) -> User:
    user = User.objects.create_user(
        username="teacher1", email="teacher@test.com", password="pass", role="teacher"
    )
    TeacherProfile.objects.create(user=user)
    return user


@pytest.fixture
def attendance_record(
    db: None, student: User, period: Period, subject: Subject
) -> AttendanceRecord:
    return AttendanceRecord.objects.create(
        student=student,
        date=timezone.now().date(),
        period=period,
        subject=subject,
        status="present",
    )


@pytest.mark.django_db
class TestMyAttendanceView:
    def test_returns_own_records_only(
        self, client: APIClient, student: User, attendance_record: AttendanceRecord
    ) -> None:
        client.force_authenticate(user=student)
        response = client.get("/api/attendance/my/")
        assert response.status_code == 200
        assert all(r["student"] == student.id for r in response.data["results"])

    def test_unauthenticated_returns_401(self, client: APIClient) -> None:
        response = client.get("/api/attendance/my/")
        assert response.status_code == 401


@pytest.mark.django_db
class TestAttendanceRecordCreateView:
    def test_perform_create_sets_recorded_by(
        self,
        client: APIClient,
        teacher: User,
        student: User,
        period: Period,
        subject: Subject,
    ) -> None:
        client.force_authenticate(user=teacher)
        payload = {
            "student": student.id,
            "date": timezone.now().date().isoformat(),
            "period": period.id,
            "subject": subject.id,
            "status": "present",
        }
        response = client.post("/api/attendance/", payload, format="json")
        assert response.status_code == 201
        record = AttendanceRecord.objects.get(id=response.data["id"])
        assert record.recorded_by == teacher
