from django.urls import path

from . import views

urlpatterns = [
    path("me/", views.CurrentUserView.as_view()),
    path("users/", views.UserListView.as_view()),
    path("classes/", views.SchoolClassListView.as_view()),
    path("classes/<int:pk>/", views.SchoolClassDetailView.as_view()),
    path("students/", views.StudentProfileListView.as_view()),
    path("teachers/", views.TeacherProfileListView.as_view()),
]
