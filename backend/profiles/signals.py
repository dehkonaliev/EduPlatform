from django.db.models.signals import post_save
from django.db.models import F
from enrollments.models import Enrollment
from django.dispatch import receiver

@receiver([post_save], sender=Enrollment)
def update_student_enrolled(sender, instance, **kwargs):
    profile = instance.student.student_profile
    profile.update(total_courses_enrolled=F('total_courses_enrolled') + 1)