from dj_rest_auth.serializers import UserDetailsSerializer
from rest_framework import serializers

from .models import ParentProfile, SchoolClass, StudentProfile, TeacherProfile, User


class UserDetailSerializer(UserDetailsSerializer):  # type: ignore[misc]
    role = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    avatar = serializers.ImageField(read_only=True)

    class Meta(UserDetailsSerializer.Meta):  # type: ignore[misc]
        model = User
        fields = UserDetailsSerializer.Meta.fields + (
            "role",
            "full_name",
            "avatar",
            "phone",
        )


class UserListSerializer(serializers.ModelSerializer[User]):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "full_name", "role", "avatar")


class SchoolClassSerializer(serializers.ModelSerializer[SchoolClass]):
    student_count = serializers.IntegerField(source="students.count", read_only=True)

    class Meta:
        model = SchoolClass
        fields = ("id", "name", "grade", "section", "year", "student_count")


class StudentProfileSerializer(serializers.ModelSerializer[StudentProfile]):
    user = UserListSerializer(read_only=True)
    school_class = SchoolClassSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = ("id", "user", "school_class", "student_number", "date_of_birth")


class TeacherProfileSerializer(serializers.ModelSerializer[TeacherProfile]):
    user = UserListSerializer(read_only=True)

    class Meta:
        model = TeacherProfile
        fields = ("id", "user", "title", "room")


class ParentProfileSerializer(serializers.ModelSerializer[ParentProfile]):
    user = UserListSerializer(read_only=True)
    children = UserListSerializer(many=True, read_only=True)

    class Meta:
        model = ParentProfile
        fields = ("id", "user", "children")
