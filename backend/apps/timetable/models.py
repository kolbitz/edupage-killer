from django.db import models


class Subject(models.Model):
    name = models.CharField(max_length=100)
    short_name = models.CharField(max_length=20)
    color = models.CharField(max_length=7, default="#6366f1")
    edupage_id = models.CharField(max_length=100, blank=True, db_index=True)

    def __str__(self) -> str:
        return self.name


class Room(models.Model):
    name = models.CharField(max_length=50)
    capacity = models.PositiveSmallIntegerField(default=30)
    building = models.CharField(max_length=50, blank=True)
    floor = models.SmallIntegerField(default=0)
    edupage_id = models.CharField(max_length=100, blank=True, db_index=True)

    def __str__(self) -> str:
        return self.name


class Period(models.Model):
    number = models.PositiveSmallIntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    name = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ["number"]

    def __str__(self) -> str:
        return f"Period {self.number} ({self.start_time}-{self.end_time})"


class DayOfWeek(models.IntegerChoices):
    MONDAY = 1, "Monday"
    TUESDAY = 2, "Tuesday"
    WEDNESDAY = 3, "Wednesday"
    THURSDAY = 4, "Thursday"
    FRIDAY = 5, "Friday"
    SATURDAY = 6, "Saturday"
    SUNDAY = 7, "Sunday"


class TimetableEntry(models.Model):
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="timetable_entries"
    )
    teacher = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": "teacher"},
        related_name="teaching_entries",
    )
    school_class = models.ForeignKey(
        "accounts.SchoolClass",
        on_delete=models.CASCADE,
        related_name="timetable_entries",
    )
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)
    period = models.ForeignKey(Period, on_delete=models.CASCADE)
    day = models.PositiveSmallIntegerField(choices=DayOfWeek.choices)
    week_type = models.CharField(
        max_length=1,
        choices=[("A", "Week A"), ("B", "Week B"), ("*", "Every week")],
        default="*",
    )
    valid_from = models.DateField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)
    edupage_id = models.CharField(max_length=100, blank=True, db_index=True)

    class Meta:
        ordering = ["day", "period__number"]

    def __str__(self) -> str:
        return f"{self.subject} - {self.school_class} - {self.get_day_display()} P{self.period.number}"


class SubstitutionEntry(models.Model):
    """Override for a specific date — teacher absent, room change, etc."""

    date = models.DateField()
    original_entry = models.ForeignKey(
        TimetableEntry,
        on_delete=models.CASCADE,
        related_name="substitutions",
        null=True,
        blank=True,
    )
    substitute_teacher = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="substitutions",
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.SET_NULL, null=True, blank=True
    )
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)
    period = models.ForeignKey(Period, on_delete=models.SET_NULL, null=True, blank=True)
    school_class = models.ForeignKey(
        "accounts.SchoolClass", on_delete=models.SET_NULL, null=True, blank=True
    )
    is_cancelled = models.BooleanField(default=False)
    note = models.TextField(blank=True)
    edupage_id = models.CharField(max_length=100, blank=True, db_index=True)

    class Meta:
        ordering = ["date", "period__number"]

    def __str__(self) -> str:
        return f"Sub {self.date} period {self.period}"
