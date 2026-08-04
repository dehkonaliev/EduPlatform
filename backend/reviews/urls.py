from django.urls import path
from .views import ReviewCreateAPIView, ReviewUpDelAPIView

urlpatterns = [
    path('review-create', ReviewCreateAPIView.as_view()),
    path('review-update-delete/<uuid:pk>', ReviewUpDelAPIView.as_view())
]