from rest_framework import serializers

from .models import Note


class NoteSerializer(serializers.ModelSerializer[Note]):
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = Note
        fields = (
            "id",
            "title",
            "content",
            "author",
            "author_name",
            "subject",
            "subject_name",
            "timetable_entry",
            "lesson_date",
            "visibility",
            "school_class",
            "shared_with",
            "created_at",
            "updated_at",
            "tags",
        )
        read_only_fields = ("author", "created_at", "updated_at")
