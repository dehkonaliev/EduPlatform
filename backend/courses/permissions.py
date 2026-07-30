from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsInstructorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.user_role == 'INSTRUCTOR' or request.user.user_role == "SUPERUSER")
        )
        
    def has_object_permission(self, request, view, obj):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user == obj.instructor or request.user.user_role == "SUPERUSER")
        )
        
class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True    
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.user_role == "SUPERUSER"
        )