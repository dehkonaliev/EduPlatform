from rest_framework.permissions import BasePermission
from .models import CustomUser

class IsOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_staff or user.is_superuser or getattr(user, 'user_role', None) == user.UserRole.SUPERUSER:
            return True

        owner = getattr(obj, 'user', obj)
        return owner == user