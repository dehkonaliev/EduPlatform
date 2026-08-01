from django.urls import path
from .views import (EnrollmentCreateAPIView, EnrollmentDropAPIView, 

)

urlpatterns = [
    path('enrollment-create', EnrollmentCreateAPIView.as_view()),
    path('enrollment-drop/<uuid:pk>', EnrollmentDropAPIView.as_view()),
]