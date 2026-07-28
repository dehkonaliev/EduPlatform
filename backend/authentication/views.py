from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import CustomUser, CodeVerify
from .utils import generate_code, check_code, is_expired_code
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from baseapp.emails import send_verification_code
from django.db.models import Q
from baseapp.emails import send_verification_code
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import (EmailOrPhoneSerializer, VerifyCodeSerializer, ActivateUserSerializer,
    LoginSerializer, LogoutSerializer, UpdateProfileSerializer, PasswordChangeSerializer, 
    VerifyEmailSerializer, VerifyPhoneSerializer, PasswordResetRequestSerializer
)




class EmailOrPhoneAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = EmailOrPhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        auth_type = serializer.validated_data.get('auth_type')
        
        is_expired_code(user)
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
        veirification.is_used = True
        veirification.save()
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
        
class PasswordChangeAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = PasswordChangeSerializer(instance=request.user, data=request.data, context={'user':request.user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': "Password changed!",
            'status': status.HTTP_200_OK
        })
        
class DeleteAccountAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        veirfy_type = request.data.get('verify_type')
        if veirfy_type == "VIA_EMAIL":
            if not user.email_verified:
                raise ValidationError("You cannot delete your account via email. Your email is not verified!")
            
            is_expired_code(user)
            code = generate_code(user, veirfy_type)
            send_verification_code(user.email, code)
            
            return Response({
                "message": "We have sent a verification code to your email!",
                'status': status.HTTP_200_OK,
                "veirfy_type": "VIA_EMAIL"
            })
        elif veirfy_type == "VIA_PHONE":
            if not user.email_verified:
                raise ValidationError("You cannot delete your account via phone. Your phone number is not verified!")
            
            is_expired_code(user)
            code = generate_code(user, veirfy_type)
            
            return Response({
                "message": "You can get your verification code via telegram bot by sharing your phone number!",
                'status': status.HTTP_200_OK,
                "veirfy_type": "VIA_PHONE"
            })
        else:
            raise ValidationError("None type verify type!")
    
    def post(self, request):
        user = request.user
        code = request.data.get('verification_code')
        code = user.codes.filter(code=code, is_used=False).order_by('-expire_time').first()
        if not code:
            raise ValidationError("Invalid code!")
        elif code.expire_time < timezone.now():
            raise ValidationError("Verification code expired!")
        
        user.account_status = CustomUser.AccountStatus.DELETED
        user.save()
        
        return Response({
            'msg': "Account set deleted!",
            'status': status.HTTP_200_OK,
            'account_status': user.account_status
        })

class VerifyEmailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        serializer = VerifyEmailSerializer(instance=user, data=request.data, context={"user":user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        new_email = serializer.validated_data.get('email')
        
        is_expired_code(user)
        code = generate_code(user, "VIA_EMAIL")
        send_verification_code(new_email, code)
        return Response({
            'msg': "We have sent a verification code to your email!",
            "status": status.HTTP_200_OK,
            "verifying": "email"
        })
        
    def post(self, request):
        user = request.user
        code = request.data.get('code')
        if len(code) > 6 and not code.isdigit():
            raise ValidationError("Invalid code!")
        
        verification = check_code(user, code)
        
        user.email_verified = True
        user.save()
        
        return Response({
            'message': "Your email verified!",
            'status': status.HTTP_200_OK
        })
        
class VerifyPhoneAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        serializer = VerifyPhoneSerializer(instance=user, data=request.data, context={"user":user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        new_phone = serializer.validated_data.get('phone_number')
        
        is_expired_code(user)
        code = generate_code(user, "VIA_PHONE")
        return Response({
            'msg': "You can get your code via our telegram bot!",
            "status": status.HTTP_200_OK,
            "verifying": "phone"
        })
        
    def post(self, request):
        user = request.user
        code = request.data.get('code')
        if len(code) > 6 and not code.isdigit():
            raise ValidationError("Invalid code!")
        
        verification = check_code(user, code)
        
        user.phone_verified = True
        user.save()
        
        return Response({
            'message': "Your phone number verified!",
            'status': status.HTTP_200_OK
        })

class PasswordResetRequestAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        verify_type = serializer.validated_data['verify_type']
        if verify_type == 'VIA_EMAIL':
            return Response({
                'message': "We have sent reset password link to your email!",
                'email': serializer.validated_data['email_or_phone'],
                'status': status.HTTP_200_OK
            })
            
        
        
        
        
        
            
        
                    