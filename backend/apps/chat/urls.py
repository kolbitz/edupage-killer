from django.urls import path

from . import views

urlpatterns = [
    path("channels/", views.ChannelListView.as_view()),
    path("channels/<int:pk>/", views.ChannelDetailView.as_view()),
    path("channels/<int:channel_id>/messages/", views.MessageListView.as_view()),
    path("channels/<int:channel_id>/join/", views.JoinChannelView.as_view()),
]
