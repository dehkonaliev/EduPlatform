from django.urls import path
from .views import (EnrollmentCreateAPIView, EnrollmentDropAPIView, CompleteLessonAPIView, LastLessonAPIView

)

urlpatterns = [
    path('enrollment-create', EnrollmentCreateAPIView.as_view()),
    path('enrollment-drop/<uuid:pk>', EnrollmentDropAPIView.as_view()),
    path('lesson-progress/<uuid:pk>', CompleteLessonAPIView.as_view()),
    path('last-lesson', LastLessonAPIView.as_view()),
]