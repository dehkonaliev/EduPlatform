from rest_framework import serializers
from .models import Enrollment, LessonProgress
from baseapp.utils import field_error


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'status']
        read_only_fields = ['id']
        
    def validate_course(self, course):
        if not course:
            return field_error("course", "Course not found")
        if course.status != "PUBLISHED":
            return field_error("course", 'Course not found')
        
        student = self.context.get('request').user
        if course.enrollments.filter(student=student).exists():
            return field_error("course", 'Course already enrolled')
        
        return course
        
    def create(self, validated_data):
        student = self.context.get('request').user
        validated_data['student'] = student
        
        return Enrollment.objects.create(**validated_data)
        