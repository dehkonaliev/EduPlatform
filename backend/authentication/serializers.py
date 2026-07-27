from rest_framework import serializers
from .models import CustomUser
from .utils import check_email_or_phone
from rest_framework.exceptions import ValidationError
from django.db.models import Q
import uuid
from django.utils import timezone


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            'id', 'email', 'phone_number', 'first_name', 'last_name',
            'user_role', 'auth_type', 'account_status',
            'email_verified', 'phone_verified', 'photo',
        )
        read_only_fields = fields


class EmailOrPhoneSerializer(serializers.Serializer):
    email_or_phone = serializers.CharField()

    def validate(self, attrs):
        email_or_phone = attrs.get('email_or_phone')
        auth_type = check_email_or_phone(email_or_phone)

        if auth_type == 'VIA_PHONE':
            user = CustomUser.objects.filter(phone_number=email_or_phone).first()
        elif auth_type == 'VIA_EMAIL':
            user = CustomUser.objects.filter(email=email_or_phone).first()
        else:
            raise ValidationError("Email or phone number is not valid!")

        if user and user.account_status != CustomUser.AccountStatus.PENDING:
            field = 'phone number' if auth_type == 'VIA_PHONE' else 'email address'
            raise ValidationError(f"User with this {field} already exists!")

        attrs['auth_type'] = auth_type
        attrs['existing_user'] = user
        return attrs

    def create(self, validated_data):
        user = validated_data['existing_user']
        auth_type = validated_data['auth_type']
        email_or_phone = validated_data['email_or_phone']
        username = f"user_{uuid.uuid4().hex[:12]}"

        if user:
            return user

        data = {'auth_type': auth_type, 'username': username}
        
        if auth_type == 'VIA_PHONE':
            data['phone_number'] = email_or_phone
            data['email'] = f"useremail_{uuid.uuid4().hex[:10]}@gmail.com"
        else:
            data['email'] = email_or_phone

        user = CustomUser.objects.create_user(**data)
        return user
    

class VerifyCodeSerializer(serializers.Serializer):
    verification_code = serializers.CharField()
    email_or_phone = serializers.CharField(required=False)
    
    def validate(self, attrs):
        code = attrs['verification_code']
        email_or_phone = attrs['email_or_phone']
        
        if not code.isdigit() and len(code) != 6:
            raise ValidationError("The verification code is incorrect!")
        
        user = CustomUser.objects.filter(Q(email=email_or_phone) | Q(phone_number=email_or_phone)).first()
        
        if not user:
            raise ValidationError("User Not Found!")
        
        verification = user.codes.filter(code=code, is_used=False).order_by('-expire_time').first()
        if not verification:
            raise ValidationError("Invalid code!")
        elif verification.expire_time < timezone.now():
            raise ValidationError("Code expired!")
        
        attrs['verification'] = verification
        attrs['user'] = user
        return attrs
        
         
            
    

