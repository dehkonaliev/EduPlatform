from django.contrib import admin
from .models import InstructorProfile, StudentProfile

admin.site.register(StudentProfile)
admin.site.register(InstructorProfile)
