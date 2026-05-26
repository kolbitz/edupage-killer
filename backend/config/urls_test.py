from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/auth/social/", include("allauth.socialaccount.urls")),
    path("api/accounts/", include("apps.accounts.urls")),
    path("api/timetable/", include("apps.timetable.urls")),
    path("api/attendance/", include("apps.attendance.urls")),
    path("api/materials/", include("apps.materials.urls")),
    path("api/chat/", include("apps.chat.urls")),
    path("api/assignments/", include("apps.assignments.urls")),
    path("api/notes/", include("apps.notes.urls")),
    path("api/edupage-sync/", include("apps.edupage_sync.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
