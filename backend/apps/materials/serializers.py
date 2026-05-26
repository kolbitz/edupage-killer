from rest_framework import serializers

from .models import Material, MaterialComment


class MaterialCommentSerializer(serializers.ModelSerializer[MaterialComment]):
    author_name = serializers.CharField(source="author.full_name", read_only=True)

    class Meta:
        model = MaterialComment
        fields = ("id", "author", "author_name", "content", "created_at")
        read_only_fields = ("author", "created_at")


class MaterialSerializer(serializers.ModelSerializer[Material]):
    uploaded_by_name = serializers.CharField(
        source="uploaded_by.full_name", read_only=True
    )
    comments = MaterialCommentSerializer(many=True, read_only=True)
    comment_count = serializers.IntegerField(source="comments.count", read_only=True)

    class Meta:
        model = Material
        fields = (
            "id",
            "title",
            "description",
            "material_type",
            "file",
            "url",
            "subject",
            "timetable_entry",
            "school_class",
            "uploaded_by",
            "uploaded_by_name",
            "visibility",
            "shared_with",
            "created_at",
            "lesson_date",
            "comments",
            "comment_count",
        )
        read_only_fields = ("uploaded_by", "created_at")
