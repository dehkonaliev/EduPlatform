from django.urls import path
from .views import (EmailOrPhoneAPIView, VerifyCodeAPIView, ActivateUserAPIView, LoginAPIView, LogoutAPIView,
    UpdateProfileAPIView, PasswordChangeAPIView, DeleteAccountAPIView, VerifyEmailAPIView,
    VerifyPhoneAPIView, PasswordResetRequestAPIView
)

urlpatterns = [
    path('signup', EmailOrPhoneAPIView.as_view()),
    path('verification-code', VerifyCodeAPIView.as_view()),
    path('activation', ActivateUserAPIView.as_view()),
    path('login', LoginAPIView.as_view()),
    path('logout', LogoutAPIView.as_view()),
    path('update-profile', UpdateProfileAPIView.as_view()),
    path('password-change', PasswordChangeAPIView.as_view()),
    path('delete-account', DeleteAccountAPIView.as_view()),
    path('veirfy-email', VerifyEmailAPIView.as_view()),
    path('veirfy-phone', VerifyPhoneAPIView.as_view()),
    path('password-reset-request', PasswordResetRequestAPIView.as_view()),
]