from django.urls import path
from .views import (CourseCreateAPIView, CategoryAPIView, TagAPIView, CourseUpDelAPIView, ModuleCreateAPIView, ModuleUpdateDeleteAPIView)


urlpatterns = [
    path('course-create', CourseCreateAPIView.as_view()),
    path('course-update-delete/<uuid:pk>', CourseUpDelAPIView.as_view()),
    path('module-create', ModuleCreateAPIView.as_view()),
    path('module-update-delete/<uuid:pk>', ModuleUpdateDeleteAPIView.as_view()),
    path('categories', CategoryAPIView.as_view()),
    path('tags', TagAPIView.as_view()),
]
