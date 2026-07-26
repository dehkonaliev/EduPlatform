import random
from .models import CodeVerify
import re

def generate_code(user, verify_type):
    code = str(random.randint(100000, 999999))
    if verify_type=='VIA_EMAIL':
        CodeVerify.objects.create(user=user, code=code, verify_type=verify_type)
        # email_sender
    elif verify_type=='VIA_PHONE':
        CodeVerify.objects.create(user=user, code=code, verify_type=verify_type)
        # telegram_bot
        
    return code

def check_email_or_phone(user_input):
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    phone_pattern = r"^\d{9}$"
    
    if re.fullmatch(email_pattern, user_input):
        return 'VIA_EMAIL'
    elif re.fullmatch(phone_pattern, user_input):
        return 'VIA_PHONE'
    
    return False
    
        
    