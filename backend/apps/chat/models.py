from django.db import models


class Channel(models.Model):
    class ChannelType(models.TextChoices):
        CLASS = "class", "Class"
        SUBJECT = "subject", "Subject"
        DIRECT = "direct", "Direct"
        GROUP = "group", "Group"

    name = models.CharField(max_length=100)
    channel_type = models.CharField(max_length=20, choices=ChannelType.choices)
    description = models.TextField(blank=True)
    school_class = models.ForeignKey(
        "accounts.SchoolClass",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="channels",
    )
    subject = models.ForeignKey(
        "timetable.Subject",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="channels",
    )
    members = models.ManyToManyField(  # type: ignore[var-annotated]
        "accounts.User", through="ChannelMembership", related_name="channels"
    )
    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_channels",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_archived = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class ChannelMembership(models.Model):
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE)
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)
    last_read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("channel", "user")


class Message(models.Model):
    channel = models.ForeignKey(
        Channel, on_delete=models.CASCADE, related_name="messages"
    )
    author = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="messages"
    )
    content = models.TextField()
    attachment = models.FileField(
        upload_to="chat_attachments/%Y/%m/", null=True, blank=True
    )
    reply_to = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="replies"
    )
    edited_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.author} in {self.channel}: {self.content[:50]}"


class MessageReaction(models.Model):
    message = models.ForeignKey(
        Message, on_delete=models.CASCADE, related_name="reactions"
    )
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    emoji = models.CharField(max_length=10)

    class Meta:
        unique_together = ("message", "user", "emoji")
