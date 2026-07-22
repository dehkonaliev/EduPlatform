from django.db import models
from baseapp.models import BaseModel

class StudentProfile(BaseModel):
    class Genders(models.TextChoices):
        MALE = 'MALE', 'male'
        FEMALE = 'FEMALE', 'female'
    
    user = models.OneToOneField('authentication.CustomUser', on_delete=models.CASCADE, related_name='student_profile')
    gender = models.CharField(max_length=10, choices=Genders.choices, blank=True, null=True)
    bio = models.CharField(max_length=1500, blank=True, null=True)
    
    total_courses_enrolled = models.PositiveIntegerField(default=0)
    total_courses_completed = models.PositiveIntegerField(default=0)
    total_certificates_earned = models.PositiveIntegerField(default=0)
    

class InstructorProfile(BaseModel):
    user = models.OneToOneField('authentication.CustomUser', on_delete=models.CASCADE, related_name='instructor_profile')
    headline = models.CharField(max_length=200, blank=True, null=True)
    bio = models.CharField(max_length=2000, blank=True, null=True)
    
    linkedin_url = models.URLField(blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    
    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        
    total_courses_created = models.PositiveIntegerField(default=0)
    total_students_taught = models.PositiveIntegerField(default=0)
    
    approval_status = models.CharField(max_length=10, choices=ApprovalStatus.choices, blank=True, null=True)
    
