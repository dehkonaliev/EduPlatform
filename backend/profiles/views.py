from django.shortcuts import render
from authentication.models import CustomUser
from .models import StudentProfile, InstructorProfile
from rest_framework.views import APIView
from baseapp.permissions import IsStudentOrAdmin, IsInstructorOrAdmin
from baseapp.utils import error_response, success_response
from rest_framework.permissions import IsAuthenticated
from .serializers import (StudentProfileSerializer, InstructorProfileSerializer

)


class StudentProfileAPIView(APIView):
    permission_classes = [IsAuthenticated, IsStudentOrAdmin]
    def get(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return error_response(message="Student profile not found", status_code=404)
        
        self.check_object_permissions(request, profile)
        
        serializer = StudentProfileSerializer(profile)
        
        return success_response(message="Student profile retreived", data=serializer.data)
    
    def patch(self, request):
        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return error_response(message="Student profile not found", status_code=404)
        
        serializer = StudentProfileSerializer(instance=profile, data=request.data, partial=True)
        serializer.is_valid()
        serializer.save()
        
        return success_response(message="Student profile updated", data=serializer.data)
    

class InstructorProfileAPIView(APIView):
    permission_classes = [IsAuthenticated, IsInstructorOrAdmin]
    def get(self, request):
        profile = InstructorProfile.objects.filter(instructor=request.user).first()
        if not profile:
            return error_response(message="Instructor profile not found", status_code=404)
        
        serializer = InstructorProfileSerializer(profile)
        
        return success_response(message="Instructor profile retreived", data=serializer.data)
    
    def patch(self, request):
        profile = InstructorProfile.objects.filter(instructor=request.user).first()
        if not profile:
            return error_response(message="Instructor profile not found", status_code=404)
        
        serializer = InstructorProfileSerializer(instance=profile, data=request.data, partial=True)
        serializer.is_valid()
        serializer.save()
        
        return success_response(message="Instructor profile updated", data=serializer.data)
        
        
        
