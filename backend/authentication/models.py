from django.db import models
from django.contrib.auth.models import AbstractUser
from baseapp.models import BaseModel


class CustomUser(AbstractUser, BaseModel):
    class UserRole(models.TextChoices):
        STUDENT = 'STUDENT', 'student'
        CONTRIBUTOR = 'CONTRIBUTOR', 'contributor'
        SUPERUSER = 'SUPERUSER', 'superuser'
        
    class AuthType(models.TextChoices):
        EMAIL = 'EMAIL', 'email'
        PHONE = 'PHONE', 'phone'
        GOOGLE = 'GOOGLE', 'google'
        
    class AccountStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        BLOCKED = 'BLOCKED', 'Blocked'
        DELETED = 'DELETED', 'Deleted'
        
    
        
    account_status = models.CharField(max_length=20, choices=AccountStatus.choices, default=AccountStatus.PENDING)
    user_role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.STUDENT)
    auth_type = models.CharField(max_length=20, choices=AuthType.choices, default=AuthType.EMAIL)
    
    #email
    email = models.EmailField(unique=True, null=True, blank=True)
    email_verified = models.BooleanField(default=False)
    
    
    #phone
    phone_number = models.CharField(max_length=13, unique=True, null=True, blank=True)
    phone_verified = models.BooleanField(default=False)
    
    photo = models.ImageField(upload_to='users/', blank=True, null=True)
    
    #To avoid default required username field problem!
    USERNAME_FIELD = email
    REQUIRED_FIELDS = []
    
    @property
    def is_verified(self):
        return self.email_verified or self.phone_verified
    
    