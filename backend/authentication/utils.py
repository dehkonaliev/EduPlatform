import random
from django.core.exceptions import ValidationError
from .models import CodeVerify
import re
from rest_framework import serializers

def generate_code(user, verify_type):
    code = str(random.randint(100000, 999999))
    if verify_type=='VIA_EMAIL':
        CodeVerify.objects.create(user=user, code=code, verify_type=verify_type)
        # email_sender
    elif verify_type=='VIA_PHONE':
        CodeVerify.objects.create(user=user, code=code, verify_type=verify_type)
        # telegram_bot
        
    return code

def check_email_username_phone(user_input):
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    phone_pattern = r"^\d{9}$"
    username_pattern = r"^(?=.{3,16}$)[a-zA-Z][a-zA-Z0-9]*(?:_[a-zA-Z0-9]+)*$"
    
    if re.fullmatch(email_pattern, user_input):
        return 'VIA_EMAIL'
    elif re.fullmatch(phone_pattern, user_input):
        return 'VIA_PHONE'
    elif re.fullmatch(username_pattern, user_input):
        return 'VIA_USERNAME'
    
    return False


def check_password(password):
    if not re.search(r'[A-Z]', password):
        raise serializers.ValidationError({"password": f"Password must contain at least one uppercase letter."})
    if not re.search(r'[a-z]', password):
        raise serializers.ValidationError({"password": "Password must contain at least one lowercase letter."})
    if not re.search(r'[0-9]', password):
        raise serializers.ValidationError({"password": "Password must contain at least one digit."})
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/;\'~`]', password):
        raise serializers.ValidationError({"password": "Password must contain at least one special character."})
    return True

    
        
    