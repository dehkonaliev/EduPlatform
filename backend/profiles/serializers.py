from rest_framework import serializers
from .models import StudentProfile, InstructorProfile
from django.core.validators import URLValidator
import re
from .models import StudentProfile


class InstructorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstructorProfile
        fields = ['headline', 'bio', 'linkedin_url', 'website_url']

    def validate_headline(self, value):
        value = value.strip()
        if len(value) < 5:
            raise serializers.ValidationError(
                "Headline must be at least 5 characters long."
            )
        if len(value) > 120:
            raise serializers.ValidationError(
                "Headline cannot exceed 120 characters."
            )
        return value

    def validate_bio(self, value):
        value = value.strip()
        if len(value) < 20:
            raise serializers.ValidationError(
                "Bio must be at least 20 characters long."
            )
        if len(value) > 2000:
            raise serializers.ValidationError(
                "Bio cannot exceed 2000 characters."
            )
        return value

    def validate_linkedin_url(self, value):
        if not value:
            return value
        value = value.strip()

        validator = URLValidator(schemes=['http', 'https'])
        try:
            validator(value)
        except:
            raise serializers.ValidationError("Enter a valid URL.")

        if not re.search(r'(https?://)?(www\.)?linkedin\.com/', value, re.IGNORECASE):
            raise serializers.ValidationError(
                "Please enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/your-name)."
            )
        return value

    def validate_website_url(self, value):
        if not value:
            return value
        value = value.strip()

        validator = URLValidator(schemes=['http', 'https'])
        try:
            validator(value)
        except:
            raise serializers.ValidationError("Enter a valid URL.")
        return value

    def validate(self, attrs):
        # At least one of the two links should be provided
        linkedin_url = attrs.get('linkedin_url', getattr(self.instance, 'linkedin_url', None))
        website_url = attrs.get('website_url', getattr(self.instance, 'website_url', None))

        if not linkedin_url and not website_url:
            raise serializers.ValidationError(
                "Please provide at least a LinkedIn or a website URL."
            )
        return attrs
        
    
    def update(self, instance, validated_data):
            return super().update(instance, validated_data)
        
class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['gender', 'bio']

    def validate_gender(self, value):
        valid_values = StudentProfile.Genders.values
        if value not in valid_values:
            raise serializers.ValidationError(
                f"Gender must be one of: {', '.join(valid_values)}."
            )
        return value

    def validate_bio(self, value):
        value = value.strip()
        if len(value) > 2000:
            raise serializers.ValidationError(
                "Bio cannot exceed 2000 characters."
            )
        return value
        
    
    def update(self, instance, validated_data):
        return super().update(instance, validated_data)