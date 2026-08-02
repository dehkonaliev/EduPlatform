from rest_framework import serializers
from .models import Enrollment, LessonProgress
from baseapp.utils import field_error
from courses.models import Lesson


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'course']
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
        
        enrollment = Enrollment.objects.create(**validated_data)
        course = validated_data['course']
        lesson = Lesson.objects.filter(module__course=course).order_by('order').first()
        LessonProgress.objects.create(enrollment=enrollment, lesson=lesson)
        
        return enrollment
    

class ProgressCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ['id', 'enrollment', 'lesson']
        read_only_fields = ['id']

    def validate_enrollment(self, enrollment):
        if enrollment.course.status != "PUBLISHED":
            raise serializers.ValidationError({"enrollment": "Enrollment not found"})

        student = self.context.get('request').user
        if enrollment.student != student:
            raise serializers.ValidationError({"enrollment": "Enrollment not found"})

        return enrollment

    def validate(self, data):
        enrollment = data['enrollment']
        lesson = data['lesson']

        if lesson.module.course_id != enrollment.course_id:
            raise serializers.ValidationError(
                {"lesson": "Lesson does not belong to the enrolled course"}
            )

        course_lessons = list(
            Lesson.objects.filter(module__course_id=enrollment.course_id)
            .order_by('module__order', 'order')
            .values_list('id', flat=True)
        )
        lesson_index = course_lessons.index(lesson.id)

        if lesson_index > 0:
            previous_lesson_id = course_lessons[lesson_index - 1]
            completed_previous = enrollment.lessons_progress.filter(
                is_completed=True, lesson_id=previous_lesson_id
            ).exists()
            if not completed_previous:
                raise serializers.ValidationError(
                    {"lesson": "You must complete the previous lesson first"}
                )

        return data

    def create(self, validated_data):
        return LessonProgress.objects.create(**validated_data)

         