from django.shortcuts import render
from .models import StudentWallet, Subscriptions, WalletTransaction
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from baseapp.utils import error_response, success_response
from .serializers import ReplenishWalletSerializer


class ReplenishWalletAPIView(APIView):
    permission_classes = [AllowAny]
    def patch(self, request):
        serializer = ReplenishWalletSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Wallet replenished", data=serializer.data)