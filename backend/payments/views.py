from django.shortcuts import render
from .models import StudentWallet, Subscription, WalletTransaction, Plan
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from baseapp.utils import error_response, success_response
from baseapp.permissions import IsStudentAndOwner, IsAdminOrReadOnly
from .serializers import ReplenishWalletSerializer, SubscribeSerializer, PlanSerializer, BuyCourseSerializer


class ReplenishWalletAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    def patch(self, request):
        serializer = ReplenishWalletSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Wallet replenished", data=serializer.data)
    

class SubscribeAPIView(APIView):
    permission_classes = [IsAuthenticated, IsStudentAndOwner]
    
    def post(self, request):
        if request.user.account_status != "ACTIVE":
            return error_response(message="Account is not active")
        serializer = SubscribeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        serializer.save()
        
        return success_response(message="Subscribed", data=serializer.data, status_code=201)

class PlansAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        plans = Plan.objects.all()
        serializer = PlanSerializer(plans, many=True)
        
        return success_response(message="Active plans", data=serializer.data)
    
class BuyCourseAPIView(APIView):
    permission_classes = [IsAuthenticated, IsStudentAndOwner]
    def post(self, request):
        if request.user.account_status != "ACTIVE":
            return error_response(message="Your account is not active")
        serializer = BuyCourseSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Bought course successfully", data=serializer.data, status_code=201)