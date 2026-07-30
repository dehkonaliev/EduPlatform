from django.urls import path
from .views import (CourseCreateAPIView, CategoryAPIView, TagAPIView)


urlpatterns = [
    path('course-create', CourseCreateAPIView.as_view()),
    path('categories', CategoryAPIView.as_view()),
    path('tags', TagAPIView.as_view()),
]
