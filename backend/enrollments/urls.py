from django.urls import path
from .views import (EnrollmentCreateAPIView, EnrollmentDropAPIView, CompleteLessonAPIView, ProgressGetAPIView

)

urlpatterns = [
    path('enrollment-create', EnrollmentCreateAPIView.as_view()),
    path('enrollment-drop/<uuid:pk>', EnrollmentDropAPIView.as_view()),
    path('lesson-progress/<uuid:pk>', CompleteLessonAPIView.as_view()),
    path('get-progress', ProgressGetAPIView.as_view()),
]