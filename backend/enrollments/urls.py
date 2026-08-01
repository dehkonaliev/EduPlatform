from django.urls import path
from .views import EnrollmentCreateAPIView

urlpatterns = [
    path('enrollment-create', EnrollmentCreateAPIView.as_view())
]