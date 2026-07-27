from django.urls import path
from .views import (EmailOrPhoneAPIView, VerifyCodeAPIView, ActivateUserAPIView)

urlpatterns = [
    path('signup', EmailOrPhoneAPIView.as_view()),
    path('verification-code', VerifyCodeAPIView.as_view()),
    path('activation', ActivateUserAPIView.as_view()),
]