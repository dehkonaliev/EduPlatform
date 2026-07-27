from django.urls import path
from .views import (EmailOrPhoneAPIView, VerifyCodeAPIView, ActivateUserAPIView, LoginAPIView)

urlpatterns = [
    path('signup', EmailOrPhoneAPIView.as_view()),
    path('verification-code', VerifyCodeAPIView.as_view()),
    path('activation', ActivateUserAPIView.as_view()),
    path('login', LoginAPIView.as_view()),
]