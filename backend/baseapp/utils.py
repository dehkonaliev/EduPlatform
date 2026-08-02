from rest_framework.response import Response
from rest_framework import serializers
import secrets
import string


def generate_wallet_id(length=8):
    alphabet = string.ascii_uppercase + string.digits  # A-Z, 0-9
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def success_response(message='', data=None, status_code=200):
    return Response({
        "success": True,
        "message": message,
        "data": data
    }, status=status_code)
    
    
def error_response(message="", errors=None, status_code=400):
    return Response({
        "success": False,
        "message": message,
        "errors": errors
    }, status=status_code)
    
def field_error(field, message):
    raise serializers.ValidationError({
        field: message
    })
