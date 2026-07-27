from rest_framework.permissions import BasePermission
from .models import CustomUser


class IsOwnerOrAdmin(BasePermission):
    pass