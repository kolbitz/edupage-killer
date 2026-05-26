from django.urls import path

from . import views

urlpatterns = [
    path("subjects/", views.SubjectListView.as_view()),
    path("rooms/", views.RoomListView.as_view()),
    path("periods/", views.PeriodListView.as_view()),
    path("entries/", views.TimetableEntryListView.as_view()),
    path("my/", views.MyTimetableView.as_view()),
    path("substitutions/", views.SubstitutionListView.as_view()),
]
