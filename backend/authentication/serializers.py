from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser
from .utils import check_email_username_phone
from rest_framework.exceptions import ValidationError
from django.db.models import Q
import uuid
from django.utils import timezone
import re
from rest_framework_simplejwt.tokens import RefreshToken


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
        auth_type = check_email_username_phone(email_or_phone)

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


class ActivateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    conf_password = serializers.CharField(write_only=True)
    email_or_phone = serializers.CharField(write_only=True)
    user_role = serializers.ChoiceField(
        choices=[
            (CustomUser.UserRole.STUDENT, 'student'),
            (CustomUser.UserRole.INSTRUCTOR, 'instructor')
        ]
    )
    class Meta:
        model = CustomUser
        fields = ['id', 'email_or_phone', 'first_name', 'last_name', 'username', 'user_role', 'password', 'conf_password']
        read_only_fields = ['id']
        
    NAME_REGEX = re.compile(r'^[A-Za-z\u00C0-\u017F\s\'-]+$')

    def validate_first_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("First name cannot be blank.")
        if len(value) < 2:
            raise serializers.ValidationError("First name must be at least 2 characters.")
        if len(value) > 50:
            raise serializers.ValidationError("First name is too long.")
        if not self.NAME_REGEX.match(value):
            raise serializers.ValidationError("First name may only contain letters, spaces, hyphens, and apostrophes.")
        return value.title()

    def validate_last_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Last name cannot be blank.")
        if len(value) < 2:
            raise serializers.ValidationError("Last name must be at least 2 characters.")
        if len(value) > 50:
            raise serializers.ValidationError("Last name is too long.")
        if not self.NAME_REGEX.match(value):
            raise serializers.ValidationError("Last name may only contain letters, spaces, hyphens, and apostrophes.")
        return value.title()
    
    def validate_username(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Username cannot be blank.")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters.")
        if len(value) > 50:
            raise serializers.ValidationError("Username is too long.")
        if not re.fullmatch(r'^[A-Za-z0-9_]+$', value):
            raise serializers.ValidationError("Username may only contain letters, numbers, and underscores.")
        if value[0].isdigit():
            raise serializers.ValidationError("Username cannot start with a number.")
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists!")
        return value
    
    def validate(self, attrs):
        password = attrs['password']
        conf_password = attrs['conf_password']
        
        if password != conf_password:
            raise serializers.ValidationError("Confirm password doesn't match.")
        if len(password) < 8:
            raise serializers.ValidationError("Password is too short!")
        if len(password) > 50:
            raise serializers.ValidationError("Password is too long!")
        
        if not re.search(r'[A-Z]', password):
            raise serializers.ValidationError({"password": "Password must contain at least one uppercase letter."})
        if not re.search(r'[a-z]', password):
            raise serializers.ValidationError({"password": "Password must contain at least one lowercase letter."})
        if not re.search(r'[0-9]', password):
            raise serializers.ValidationError({"password": "Password must contain at least one digit."})
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/;\'~`]', password):
            raise serializers.ValidationError({"password": "Password must contain at least one special character."})
        
        return attrs
        
    def update(self, instance, validated_data):
        validated_data.pop('email_or_phone', None)
        password = validated_data.pop('password')
        validated_data.pop('conf_password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.set_password(password)
        instance.account_status = CustomUser.AccountStatus.ACTIVE
        instance.save()
        return instance
        

class LoginSerializer(serializers.Serializer):
    email_username_phone = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate_password(self, password):
        
        if len(password) < 8:
            raise serializers.ValidationError("Password is too short!")
        if len(password) > 50:
            raise serializers.ValidationError("Password is too long!")
        
        if not re.search(r'[A-Z]', password):
            raise serializers.ValidationError({"password": "Password must contain at least one uppercase letter."})
        if not re.search(r'[a-z]', password):
            raise serializers.ValidationError({"password": "Password must contain at least one lowercase letter."})
        if not re.search(r'[0-9]', password):
            raise serializers.ValidationError({"password": "Password must contain at least one digit."})
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/;\'~`]', password):
            raise serializers.ValidationError({"password": "Password must contain at least one special character."})
        
        return password
    
    def validate(self, attrs):
        email_username_phone = attrs['email_username_phone']
        password = attrs['password']
        login_type = check_email_username_phone(email_username_phone)
        user = authenticate(request=self.context.get('request'), username=email_username_phone, password=password)
        
        if not user:
            raise serializers.ValidationError("Given credentials are incorrect!")
        
        if not user.is_verified:
            raise serializers.ValidationError("Account is not verified!")
        
        refresh = RefreshToken.for_user(user)
        attrs['tokens'] = {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }
        
        attrs['user'] = user
        return attrs
    

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    
    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs
    
    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()
            
        except:
            raise serializers.ValidationError("Invalid or expired token")
        

        
        
        
        
        
        
        
                
            
    

