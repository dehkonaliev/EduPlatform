import random
from .models import CodeVerify
import re
from rest_framework import serializers
from django.utils import timezone
from baseapp.models import MyToken

def generate_code(user, verify_type):
    code = str(random.randint(100000, 999999))
    if verify_type=='VIA_EMAIL':
        CodeVerify.objects.create(user=user, code=code, verify_type=verify_type)
    elif verify_type=='VIA_PHONE':
        CodeVerify.objects.create(user=user, code=code, verify_type=verify_type)
        
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

def check_code(user, code):
    verification = user.codes.filter(code=code, is_used=False).order_by('-expire_time').first()
    if not verification:
        raise serializers.ValidationError("Invalid code!")
    elif verification.expire_time < timezone.now():
        raise serializers.ValidationError("Code expired!")
    
    return verification

def is_expired_code(user):
    last_code = user.codes.order_by('-expire_time').first()
    if last_code:
        if last_code.expire_time > timezone.now():
            raise serializers.ValidationError("Please wait until your current code expires before requesting a new one.")
    
    return last_code
        
def generate_mytoken(user, token_for):
    latest_token = user.my_tokens.order_by('-created_at').first()

    if latest_token and latest_token.is_valid():
        raise serializers.ValidationError("Please wait until your old access link expires!")

    token = MyToken.objects.create(user=user, token_for=token_for)
    return token