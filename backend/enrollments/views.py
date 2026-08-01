from django.shortcuts import render
from rest_framework.views import APIView
from .models import Enrollment, LessonProgress
from baseapp.utils import error_response, success_response
from baseapp.permissions import IsStudentAndOwner
from authentication.models import CustomUser
from .serializers import EnrollmentCreateSerializer


class EnrollmentCreateAPIView(APIView):
    permission_classes = [IsStudentAndOwner]
    
    def post(self, request):
        serializer = EnrollmentCreateSerializer(data=request.data, context={'request':request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(message="Enrollment created", data=serializer.data, status_code=201)
    
class EnrollmentDropAPIView(APIView):
    permission_classes = [IsStudentAndOwner]
    def patch(self, request, pk):
        enrollment = Enrollment.objects.filter(pk=pk).first()
        if not enrollment:
            return error_response(message="Enrollment not found", status_code=404)
        self.check_object_permissions(request, enrollment)
        
        enrollment.status = 'DROPPED'
        enrollment.save()
        return success_response(message="Enrollment dropped")
