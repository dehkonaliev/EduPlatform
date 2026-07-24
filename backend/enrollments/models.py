from django.db import models
from baseapp.models import BaseModel
from django.utils import timezone


class Enrollment(BaseModel):
    student = models.ForeignKey(
        'autentication.CustomUser',
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'user_role': 'STUDENT'}
    )
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.CASCADE,
        related_name='enrollments' 
    )
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'active'
        COMPLETED = 'COMPLETED', 'completed'
        BOUGHT = 'BOUGHT', 'bought'
        DROPPED = 'DROPPED', 'dropped'
        DEACTIVATED = 'DEACTIVATED', 'deactivated'
        
        status = models.CharField(max_length=15)
        
        progress_percentage = models.DecimalField(max_length=5, decimal_places=2, default=0.00)
        last_accessed_lesson = models.ForeignKey(
            'courses.Lesson', on_delete=models.SET_NULL, blank=True, null=True, related_name='+'
        )
        last_accessed_at = models.DateTimeField(blank=True, null=True)
        
        enrolled_at = models.DateTimeField(auto_now_add=True)
        completed_at = models.DateTimeField(blank=True, null=True)
        
        class Meta:
            unique_together = ['student', 'course']
            ordering = ['enrolled_at']
            
        def __str__(self):
            return f"{self.student.email} -> {self.course.title}"
        
    
    
    
