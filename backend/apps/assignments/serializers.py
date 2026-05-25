from rest_framework import serializers

from .models import Assignment, Grade, Submission


class AssignmentSerializer(serializers.ModelSerializer[Assignment]):
    assigned_by_name = serializers.CharField(
        source="assigned_by.full_name", read_only=True
    )
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    submission_count = serializers.IntegerField(
        source="submissions.count", read_only=True
    )
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Assignment
        fields = (
            "id",
            "title",
            "description",
            "assignment_type",
            "subject",
            "subject_name",
            "school_class",
            "assigned_by",
            "assigned_by_name",
            "due_date",
            "created_at",
            "max_score",
            "attachment",
            "is_graded",
            "submission_count",
            "is_overdue",
        )
        read_only_fields = ("assigned_by", "created_at")


class SubmissionSerializer(serializers.ModelSerializer[Submission]):
    student_name = serializers.CharField(source="student.full_name", read_only=True)

    class Meta:
        model = Submission
        fields = (
            "id",
            "assignment",
            "student",
            "student_name",
            "file",
            "text_content",
            "submitted_at",
            "status",
            "score",
            "feedback",
            "graded_by",
            "graded_at",
        )
        read_only_fields = ("student", "submitted_at", "graded_by", "graded_at")


class GradeSerializer(serializers.ModelSerializer[Grade]):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    student_name = serializers.CharField(source="student.full_name", read_only=True)

    class Meta:
        model = Grade
        fields = (
            "id",
            "student",
            "student_name",
            "subject",
            "subject_name",
            "teacher",
            "value",
            "max_value",
            "label",
            "note",
            "date",
            "is_final",
        )
        read_only_fields = ("teacher",)
