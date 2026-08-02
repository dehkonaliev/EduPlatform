from django.urls import path
from .views import ReplenishWalletAPIView

urlpatterns = [
    path('replenish-wallet', ReplenishWalletAPIView.as_view())
]