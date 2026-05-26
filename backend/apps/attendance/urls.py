from django.urls import path

from . import views

urlpatterns = [
    path("", views.AttendanceRecordListView.as_view()),
    path("my/", views.MyAttendanceView.as_view()),
    path("class/<int:class_id>/today/", views.ClassAttendanceTodayView.as_view()),
    path("justify/", views.AbsenceJustificationView.as_view()),
]
