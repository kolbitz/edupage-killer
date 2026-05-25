from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import SchoolClass, StudentProfile, TeacherProfile, User
from apps.assignments.models import Assignment
from apps.timetable.models import Subject


@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.fixture
def school_class(db: None) -> SchoolClass:
    return SchoolClass.objects.create(name="1A", grade=1, year=2024)


@pytest.fixture
def subject(db: None) -> Subject:
    return Subject.objects.create(name="Mathematics", short_name="MATH")


@pytest.fixture
def teacher(db: None) -> User:
    user = User.objects.create_user(
        username="teacher1", email="teacher@test.com", password="pass", role="teacher"
    )
    TeacherProfile.objects.create(user=user)
    return user


@pytest.fixture
def student(db: None, school_class: SchoolClass) -> User:
    user = User.objects.create_user(
        username="student1", email="student@test.com", password="pass", role="student"
    )
    StudentProfile.objects.create(user=user, school_class=school_class)
    return user


@pytest.fixture
def assignment(
    db: None, school_class: SchoolClass, subject: Subject, teacher: User
) -> Assignment:
    return Assignment.objects.create(
        title="Test Homework",
        assignment_type="homework",
        subject=subject,
        school_class=school_class,
        assigned_by=teacher,
        due_date=timezone.now() + timedelta(days=7),
    )


@pytest.mark.django_db
class TestAssignmentListView:
    def test_student_sees_own_class_assignments(
        self, client: APIClient, student: User, assignment: Assignment
    ) -> None:
        client.force_authenticate(user=student)
        response = client.get("/api/assignments/")
        assert response.status_code == 200
        assert any(a["title"] == "Test Homework" for a in response.data["results"])

    def test_teacher_sees_own_assignments(
        self, client: APIClient, teacher: User, assignment: Assignment
    ) -> None:
        client.force_authenticate(user=teacher)
        response = client.get("/api/assignments/")
        assert response.status_code == 200
        assert any(a["title"] == "Test Homework" for a in response.data["results"])

    def test_unauthenticated_returns_401(self, client: APIClient) -> None:
        response = client.get("/api/assignments/")
        assert response.status_code == 401

    def test_student_from_other_class_cannot_see_assignment(
        self,
        client: APIClient,
        subject: Subject,
        teacher: User,
        assignment: Assignment,
    ) -> None:
        other_class = SchoolClass.objects.create(name="2B", grade=2, year=2024)
        other_student = User.objects.create_user(
            username="student2", email="other@test.com", password="pass", role="student"
        )
        StudentProfile.objects.create(user=other_student, school_class=other_class)
        client.force_authenticate(user=other_student)
        response = client.get("/api/assignments/")
        assert response.status_code == 200
        assert not any(a["title"] == "Test Homework" for a in response.data["results"])
