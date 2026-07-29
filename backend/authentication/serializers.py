from rest_framework import serializers
from django.contrib.auth import authenticate, password_validation
from .models import CustomUser, UserPreference
from rest_framework.exceptions import ValidationError
from django.db.models import Q
import uuid
from profiles.models import StudentProfile, InstructorProfile
from baseapp.models import MyToken
from django.utils import timezone
import re
from baseapp.emails import send_verification_code
from rest_framework_simplejwt.tokens import RefreshToken
from .validators import name_validator, username_validator, password_validator
from .utils import (check_email_username_phone, check_code, generate_mytoken, is_expired_code,
    base_updater,
)



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
        
        
        if user:
            base_updater(user, auth_type)
            
        attrs['auth_type'] = auth_type
        attrs['existing_user'] = user
        return attrs

    def create(self, validated_data):
        auth_type = validated_data['auth_type']
        email_or_phone = validated_data['email_or_phone']
        username = f"user_{uuid.uuid4().hex[:12]}"

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
        
        verification = check_code(user, code)
        
        token = generate_mytoken(user, 'ACTIVATION')
        
        attrs['verification'] = verification
        attrs['user'] = user
        return attrs

class ActivateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    conf_password = serializers.CharField(write_only=True)
    email_or_phone = serializers.CharField(write_only=True)
    token = serializers.CharField()
    user_role = serializers.ChoiceField(
        choices=[
            (CustomUser.UserRole.STUDENT, 'student'),
            (CustomUser.UserRole.INSTRUCTOR, 'instructor')
        ]
    )
    class Meta:
        model = CustomUser
        fields = ['id', 'email_or_phone', 'token', 'first_name', 'last_name', 'username', 'user_role', 'password', 'conf_password']
        read_only_fields = ['id']
        
        
    def validate_token(self, token):
        token_obj = MyToken.objects.filter(token=token, is_used=False).first()
        if not token_obj:
            raise serializers.ValidationError("Invalid token!")
        elif not token_obj.is_valid():
            raise serializers.ValidationError("Token Expired!")
        
        return token
        
    def validate_first_name(self, value):
        return name_validator(value, "First name")

    def validate_last_name(self, value):
        return name_validator(value, "Last name")
    
    def validate_username(self, value):
        return username_validator(value)
    
    def validate(self, attrs):
        password = attrs['password']
        conf_password = attrs['conf_password']
        
        token = attrs['token']
        token_obj = MyToken.objects.filter(token=token, is_used=False).first()
        email_or_phone = attrs['email_or_phone']
        user = CustomUser.objects.filter(Q(email=email_or_phone) | Q(phone_number=email_or_phone)).first()
        
        if token_obj.user != user:
            raise serializers.ValidationError("User and token data do not match!")
        if password != conf_password:
            raise serializers.ValidationError("Confirm password doesn't match.")
        if len(password) < 8:
            raise serializers.ValidationError("Password is too short!")
        if len(password) > 50:
            raise serializers.ValidationError("Password is too long!")
        
        password_validator(password)
        attrs['user'] = user
        return attrs
    
    def save(self):
        user = self.validated_data['user']
        user.password = self.validated_data['password']
        user.set_password(self.validated_data['password'])
        if self.validated_data['user_role'] == CustomUser.UserRole.STUDENT:
            StudentProfile.objects.create(user=user)
        elif self.validated_data['user_role'] == CustomUser.UserRole.INSTRUCTOR:
            InstructorProfile.objects.create(user=user)
        user.account_status = CustomUser.AccountStatus.ACTIVE
        user.save()
        
        UserPreference.objects.create(user=user)
        
        return user
        
class LoginSerializer(serializers.Serializer):
    email_username_phone = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate_password(self, password):
        
        if len(password) < 8:
            raise serializers.ValidationError("Password is too short!")
        if len(password) > 50:
            raise serializers.ValidationError("Password is too long!")
        
        password_validator(password)
        
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
        
class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'username', 'photo']
        read_only_fields = ['id']
        
    NAME_REGEX = re.compile(r'^[A-Za-z\u00C0-\u017F\s\'-]+$')
    
    def validate_first_name(self, value):
        return name_validator(value, 'First name')

    def validate_last_name(self, value):
        return name_validator(value, "Last name")
    
    def validate_username(self, value):
        return username_validator(value)
    
    def validate_photo(self, value):
        max_size_mb = 5
        if value.size > max_size_mb * 1024 * 1024:
            raise serializers.ValidationError(f"Image must be under {max_size_mb}MB.")

        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError("Only JPEG, PNG, or WEBP images are allowed.")

        return value
    
    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
    
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    conf_password = serializers.CharField(write_only=True)
    
    def validate_new_password(self, password):
        password_validator(password)
        return password        
    
    def validate(self, attrs):
        old_password = attrs['old_password']
        new_password = attrs['new_password']
        conf_password = attrs['conf_password']
        
        
        if new_password and conf_password:
            if conf_password != new_password:
                raise serializers.ValidationError("Confirm password does not match to new password!")
            if new_password == old_password:
                raise serializers.ValidationError("Old password and new password cannot be identical!")
        else:
            raise serializers.ValidationError("New password and confirm password fields are required!")
        
        user = self.context.get('user')
        if not user.check_password(old_password):
            raise serializers.ValidationError("Old password is incorrect!")
        
        return attrs
    
    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance
        
class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs['email']
        user = self.context.get('user')
        if not re.fullmatch(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValidationError("Email is invalid!")
        base_user = CustomUser.objects.filter(email=email).first()
        
        if base_user:
            base_updater(base_user, "VIA_EMAIL")
        
        attrs['base_user'] = base_user
        return attrs
    
    def update(self, instance, validated_data):
        instance.email = validated_data['email']
        
        instance.save()
        return instance
    
class VerifyPhoneSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    
    def validate(self, attrs):
        phone_number = attrs['phone_number']
        user = self.context.get('user')
        if not re.fullmatch(r"^\d{9}$", phone_number):
            raise ValidationError("Phone number is invalid!")
        
        base_user = CustomUser.objects.filter(phone_number=phone_number).first()
        if base_user:
            base_updater(base_user, "VIA_PHONE")
        
        return attrs
    
    def update(self, instance, validated_data):
        instance.phone_number = validated_data['phone_number']
        instance.save()
        return instance    

class PasswordResetRequestSerializer(serializers.Serializer):
    email_or_phone = serializers.CharField()
    
    def validate(self, attrs):
        email_or_phone = attrs['email_or_phone']
        verify_type = check_email_username_phone(email_or_phone)
        
        if verify_type == "VIA_EMAIL":
            user = CustomUser.objects.filter(email=email_or_phone).first()
            if not user:
                raise serializers.ValidationError("User not found!")
            if user and user.email_verified == False:
                raise serializers.ValidationError("Email was not verified try with phone number!")
            
            my_token = generate_mytoken(user, "RESET_PASSWORD")
            reset_link = f"https://yourfrontend.com/reset-password/{my_token}/"
            
        elif verify_type == "VIA_PHONE":
                    user = CustomUser.objects.filter(phone_number=email_or_phone).first()
                    if not user:
                        raise serializers.ValidationError("User not found!")
                    if user and user.email_verified == False:
                        raise serializers.ValidationError("Phone number was not verified try with email!")
                    
                    my_token = generate_mytoken(user, "RESET_PASSWORD")
                    reset_link = f"https://yourfrontend.com/reset-password/{my_token}/"
        
        attrs['verify_type'] = verify_type
        return attrs
    
class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    conf_password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        token = attrs['token']
        new_password = attrs['new_password']
        conf_password = attrs['conf_password']
        
        password_validator(new_password)
        if new_password != conf_password:
            raise serializers.ValidationError("Confirm password does not match!")
        token_obj = MyToken.objects.filter(token=token, is_used=False).first()
        if not token_obj:
            raise serializers.ValidationError("Invalid token!")
        if not token_obj.is_valid():
            raise serializers.ValidationError("Token expired!")
        user = token_obj.user
        attrs['user'] = user
        attrs['token_obj'] = token_obj
        return attrs
    
    def save(self):
        user = self.validated_data['user']
        token_obj = self.validated_data['token_obj']

        user.set_password(self.validated_data['new_password'])
        user.save()

        token_obj.is_used = True
        token_obj.save()

        return user
    
    
class TokenRefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    
            
            
    
       
                
        
        
    
    
        
        
        
        
        
        
        
                
            
    

