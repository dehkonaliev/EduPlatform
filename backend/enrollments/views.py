from django.shortcuts import render
from rest_framework.views import APIView
from baseapp.utils import error_response, success_response
from baseapp.permissions import IsStudent
from authentication.models import CustomUser
from .serializers import EnrollmentCreateSerializer


class EnrollmentCreateAPIView(APIView):
    permission_classes = [IsStudent]
    
    def post(self, request):
        serializer = EnrollmentCreateSerializer(data=request.data, context={'request':request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Enrollment created", data=serializer.data, status_code=201)
