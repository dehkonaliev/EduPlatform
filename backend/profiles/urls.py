from django.urls import path
from .views import (StudentProfileAPIView, InstructorProfileAPIView, )

urlpatterns = [
    path('student-profile', StudentProfileAPIView.as_view()),
    path('instructor-profile', InstructorProfileAPIView.as_view()),
]