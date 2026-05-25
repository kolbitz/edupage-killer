from django.urls import path

from . import views

urlpatterns = [
    path("jobs/", views.SyncJobListView.as_view()),
    path("trigger/", views.TriggerSyncView.as_view()),
]
