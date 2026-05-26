from django.urls import path

from . import views

urlpatterns = [
    path("", views.AssignmentListView.as_view()),
    path("<int:pk>/", views.AssignmentDetailView.as_view()),
    path("<int:assignment_id>/submissions/", views.SubmissionListView.as_view()),
    path("grades/", views.GradeListView.as_view()),
]
