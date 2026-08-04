from rest_framework import serializers
from .models import StudentProfile, InstructorProfile
from django.core.validators import URLValidator
import re
from baseapp.utils import error_response, success_response, field_error
from .models import StudentProfile


class InstructorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstructorProfile
        fields = ['headline', 'bio', 'linkedin_url', 'website_url', 'total_courses_created', 'total_students_taught', 'approval_status']
        read_only_fields = ['total_students_taught', 'total_courses_created', 'approval_status']

    def validate_headline(self, value):
        value = value.strip()
        if len(value) < 5:
            return field_error("headline", "Headline must be at least 5 characters long.")
        if len(value) > 200:
            return field_error("headline", "Headline cannot exceed 200 characters.")
        return value

    def validate_bio(self, value):
        value = value.strip()
        if len(value) < 20:
            return field_error("bio", "Bio must be at least 20 characters long.")
        if len(value) > 2000:
            return field_error("bio", "Bio cannot exceed 2000 characters long.")
        return value

    def validate_linkedin_url(self, value):
        if not value:
            return value
        value = value.strip()

        validator = URLValidator(schemes=['http', 'https'])
        try:
            validator(value)
        except:
            return field_error("linkedin_url","Enter a valid URL.")

        if not re.search(r'(https?://)?(www\.)?linkedin\.com/', value, re.IGNORECASE):
            return field_error("linkedin_url", "Please enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/your-name).")
        return value

    def validate_website_url(self, value):
        if not value:
            return value
        value = value.strip()

        validator = URLValidator(schemes=['http', 'https'])
        try:
            validator(value)
        except:
            return field_error("website_url","Enter a valid URL.")
        return value

    def validate(self, attrs):
        linkedin_url = attrs.get('linkedin_url', getattr(self.instance, 'linkedin_url', None))
        website_url = attrs.get('website_url', getattr(self.instance, 'website_url', None))

        if not linkedin_url and not website_url:
            return field_error("non_field_error", "Please, provide at least one of above!")
        return attrs
        
        
class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['gender', 'bio', 'is_visible', 'xp', 'streak', 'level', 'total_courses_enrolled', 'total_courses_completed', 'total_certificates_earned']
        read_only_fields = ['xp', 'streak', 'level', 'total_courses_enrolled', 'total_courses_completed', 'total_certificates_earned']

    def validate_gender(self, value):
        valid_values = StudentProfile.Genders.values
        if value not in valid_values:
            return field_error("gender", f"Gender must be one of: {', '.join(valid_values)}.")
        return value

    def validate_bio(self, value):
        value = value.strip()
        if len(value) > 2000:
            return field_error("bio", "Bio cannot exceed 2000 characters.")
        return value
        

    
    