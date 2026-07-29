from rest_framework.permissions import BasePermission


class IsStudentOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.user_role == 'STUDENT' or request.user.is_staff)
        )
        
class IsInstructorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.user_role == 'INSTRUCTOR' or request.user.is_staff)
        )