from django.contrib import admin

from .models import Channel, ChannelMembership, Message, MessageReaction


@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ("name", "channel_type", "school_class", "created_at")
    list_filter = ("channel_type",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ("author", "channel", "content", "created_at", "is_deleted")
    list_filter = ("is_deleted",)
    search_fields = ("content", "author__email")


admin.site.register(ChannelMembership)
admin.site.register(MessageReaction)
