from django.urls import path
from .views import ReplenishWalletAPIView, SubscribeAPIView, PlansAPIView

urlpatterns = [
    path('replenish-wallet', ReplenishWalletAPIView.as_view()),
    path('plans', PlansAPIView.as_view()),
    path('subscribe', SubscribeAPIView.as_view()),
]