from django.urls import path
from .views import (CourseCreateAPIView, CategoryAPIView, TagAPIView, CourseUpDelAPIView, ModuleCreateAPIView, ModuleUpdateDeleteAPIView,
    LessonCreateAPIView, LessonUpDelAPIView, CourseDetailAPIView, ModuleDetailAPIView, LessonDetailAPIView, FilteredCoursesAPIView
)


urlpatterns = [
    path('categories', CategoryAPIView.as_view()),
    path('tags', TagAPIView.as_view()),
    
    #COURSES
    path('course-create', CourseCreateAPIView.as_view()),
    path('course-update-delete/<uuid:pk>', CourseUpDelAPIView.as_view()),
    path('course-detail/<uuid:pk>', CourseDetailAPIView.as_view()),
    
    path('filtered-courses', FilteredCoursesAPIView.as_view()),
    
    
    #MODULES
    path('module-create', ModuleCreateAPIView.as_view()),
    path('module-update-delete/<uuid:pk>', ModuleUpdateDeleteAPIView.as_view()),
    path('module-detail/<uuid:pk>', ModuleDetailAPIView.as_view()),
    
    #LESSONS
    path('lesson-create', LessonCreateAPIView.as_view()),
    path('lesson-update-delete/<uuid:pk>', LessonUpDelAPIView.as_view()),
    path('lesson-detail/<uuid:pk>', LessonDetailAPIView.as_view()),
]
