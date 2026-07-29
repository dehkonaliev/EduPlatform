from rest_framework import serializers
from .models import StudentProfile, InstructorProfile


class InstructorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstructorProfile
        fields = ['headline', 'bio', 'linkedin_url', 'website_url']
        
        
class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['gender', 'bio']
        
    
    def update(self, instance, validated_data):
        return super().update(instance, validated_data)