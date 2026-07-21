from django.db import models
from django.contrib.auth.models import AbstractUser
from baseapp.models import BaseModel


class CustomUser(AbstractUser, BaseModel):
    user_role = models.CharField()
    auth_type = models.CharField()
    auth_status = models.CharField()
    email = models.EmailField(unique=True, null=True, blank=True)
    phone_number = models.CharField(max_length=13, unique=True, null=True, blank=True)
    photo = models.ImageField(upload_to='users/', blank=True, null=True)
    