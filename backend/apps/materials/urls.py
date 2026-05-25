from django.urls import path

from . import views

urlpatterns = [
    path("", views.MaterialListView.as_view()),
    path("<int:pk>/", views.MaterialDetailView.as_view()),
    path("<int:material_id>/comments/", views.MaterialCommentView.as_view()),
]
