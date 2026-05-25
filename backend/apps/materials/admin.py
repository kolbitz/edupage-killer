from django.contrib import admin

from .models import Material, MaterialComment


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ("title", "material_type", "subject", "uploaded_by", "created_at")
    list_filter = ("material_type", "visibility", "subject")
    search_fields = ("title", "description")


admin.site.register(MaterialComment)
