from django.urls import path
from .views import (EnrollmentCreateAPIView, EnrollmentDropAPIView, ProgressCreateAPIView

)

urlpatterns = [
    path('enrollment-create', EnrollmentCreateAPIView.as_view()),
    path('enrollment-drop/<uuid:pk>', EnrollmentDropAPIView.as_view()),
    path('lesson-progress', ProgressCreateAPIView.as_view())
]