from django.shortcuts import render
from .serializers import EmailOrPhoneSerializer
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import CustomUser, CodeVerify
from .utils import generate_code
from rest_framework.response import Response
from rest_framework import status



class SignUpAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = EmailOrPhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        auth_type = serializer.validated_data.get('auth_type')
        
        code = generate_code(user, auth_type)
        if auth_type == 'VIA_EMAIL':
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
            
        
                    