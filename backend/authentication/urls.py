from django.urls import path
from .views import SignUpAPIView, VerifyCodeAPIView

urlpatterns = [
    path('signup', SignUpAPIView.as_view()),
    path('verification-code', VerifyCodeAPIView.as_view())
]