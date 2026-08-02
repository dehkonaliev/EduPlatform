from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from .models import Enrollment, LessonProgress
from courses.models import Lesson
from baseapp.utils import error_response, success_response
from baseapp.permissions import IsStudentAndOwner
from rest_framework.permissions import AllowAny
from authentication.models import CustomUser
from .serializers import (EnrollmentCreateSerializer, ProgressCreateSerializer,
)


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
        
        if enrollment.status not in ['ACTIVE', 'DEACTIVATED']:
            return error_response(message="Enrollment already dropped or completed", errors={'status': enrollment.status})
        
        enrollment.status = 'DROPPED'
        enrollment.save()
        return success_response(message="Enrollment dropped")
    


class CompleteLessonAPIView(APIView):
    permission_classes = [IsStudentAndOwner]

    def post(self, request, pk):
        lesson_record = get_object_or_404(LessonProgress, pk=pk)
        self.check_object_permissions(request, lesson_record.enrollment)

        if lesson_record.is_completed:
            return success_response(
                message="Lesson already completed",
                data=ProgressCreateSerializer(lesson_record).data,
            )

        enrollment = lesson_record.enrollment
        current_lesson = lesson_record.lesson

        course_lessons = list(
            Lesson.objects.filter(module__course_id=enrollment.course_id)
            .order_by('module__order', 'order')
            .values_list('id', flat=True)
        )
        current_index = course_lessons.index(current_lesson.id)

        lesson_record.is_completed = True
        lesson_record.save(update_fields=['is_completed'])

        next_progress = None
        if current_index + 1 < len(course_lessons):
            next_lesson_id = course_lessons[current_index + 1]
            next_progress, _ = LessonProgress.objects.get_or_create(
                enrollment=enrollment,
                lesson_id=next_lesson_id,
            )

        return success_response(
            message="Progress updated",
            data={
                "completed": ProgressCreateSerializer(lesson_record).data,
                "next": ProgressCreateSerializer(next_progress).data if next_progress else None,
                "course_completed": next_progress is None,
            },
        )
        
class ProgressGetAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        progress = LessonProgress.objects.all()
        return success_response(message="Progress", data = list(LessonProgress.objects.values_list('pk', flat=True)))
    
        
        