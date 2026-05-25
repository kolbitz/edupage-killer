from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    STUDENT = "student", "Student"
    PARENT = "parent", "Parent"
    TEACHER = "teacher", "Teacher"
    ADMIN = "admin", "Admin"


class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20, choices=UserRole.choices, default=UserRole.STUDENT
    )
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    edupage_id = models.CharField(max_length=100, blank=True, db_index=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "accounts_user"

    def __str__(self) -> str:
        return self.email

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip() or self.email


class SchoolClass(models.Model):
    name = models.CharField(max_length=50)
    grade = models.PositiveSmallIntegerField()
    section = models.CharField(max_length=10, blank=True)
    year = models.PositiveSmallIntegerField()
    edupage_id = models.CharField(max_length=100, blank=True, db_index=True)

    class Meta:
        unique_together = ("name", "year")

    def __str__(self) -> str:
        return self.name


class StudentProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="student_profile"
    )
    school_class = models.ForeignKey(
        SchoolClass,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students",
    )
    student_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self) -> str:
        return f"Student: {self.user}"


class TeacherProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="teacher_profile"
    )
    subjects = models.ManyToManyField("timetable.Subject", blank=True)
    title = models.CharField(max_length=50, blank=True)
    room = models.CharField(max_length=20, blank=True)

    def __str__(self) -> str:
        return f"Teacher: {self.user}"


class ParentProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="parent_profile"
    )
    children = models.ManyToManyField(
        User,
        related_name="parents",
        limit_choices_to={"role": UserRole.STUDENT},
        blank=True,
    )

    def __str__(self) -> str:
        return f"Parent: {self.user}"
