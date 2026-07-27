from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import CustomUser, CodeVerify
from .utils import generate_code
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from baseapp.emails import send_verification_code
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import (EmailOrPhoneSerializer, VerifyCodeSerializer, ActivateUserSerializer, LoginSerializer,
                          LogoutSerializer, UpdateProfileSerializer)




class EmailOrPhoneAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = EmailOrPhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        auth_type = serializer.validated_data.get('auth_type')
        last_code = user.codes.order_by('-expire_time').first()
        
        if last_code and last_code.expire_time > timezone.now():
            raise ValidationError("Please wait until your current code expires before requesting a new one.")
        
        code = generate_code(user, auth_type)
        if auth_type == 'VIA_EMAIL':
            send_verification_code(user.email, code)
            return Response({
                'message': "Code sent to the email. Please check your email",
                'email': user.email,
                'status': status.HTTP_200_OK
            })
        elif auth_type == 'VIA_PHONE':
            return Response({
                'message': "You can get your code on telegram by your account with this number!",
                'email': user.phone_number,
                'status': status.HTTP_200_OK
            })
            
class VerifyCodeAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = VerifyCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data.get('user')
        veirification = serializer.validated_data.get('verification')
        
        if veirification.verify_type == "VIA_EMAIL":
            user.email_verified = True
            user.save()
            return Response({
                'message': 'Email verified!',
                'email': user.email,
                'status': status.HTTP_200_OK
            })
        elif veirification.verify_type == "VIA_PHONE":
            user.phone_verified = True
            user.save()
            
            return Response({
                'message': 'Phone number verified!',
                'phone': user.phone_number,
                'status': status.HTTP_200_OK
            })
            
class ActivateUserAPIView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email_or_phone = request.data.get('email_or_phone')
        user = CustomUser.objects.filter(Q(email=email_or_phone) | Q(phone_number=email_or_phone)).first()
        if not user:
            raise ValidationError("User does not exists!")
        if user.account_status != CustomUser.AccountStatus.PENDING:
            raise ValidationError("User Account already activated!")
        
        serializer = ActivateUserSerializer(instance=user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': "User Activated!",
            'status': status.HTTP_200_OK,
            'data': serializer.data
        })
 
class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.validated_data['tokens']
        
        return Response({
            "message": "Logged In!",
            "status": status.HTTP_200_OK,
            'tokens': tokens
        })
        
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid()
        serializer.save()
        
        return Response({
            'message': "Logged Out Successfully!",
            'status': status.HTTP_205_RESET_CONTENT
        })
        
class UpdateProfileAPIView(APIView):
    parser_classes = [FormParser, MultiPartParser]
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        user = request.user
        serializer = UpdateProfileSerializer(instance=user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': "Profile Updated!",
            'status': status.HTTP_200_OK,
            'data': serializer.data
        })

            
        
        
        
        
            
        
                    