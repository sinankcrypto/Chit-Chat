from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from accounts.repository.emailOTP_repository import EmailOTPRepository
from .models import EmailOTP

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "confirm_password"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"password": "Passwords do not match"}
            )
        
        validate_password(attrs["password"])    
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            is_active=False,
        )

        otp_obj,created = EmailOTPRepository.get_or_create_by_user(user)
        otp_obj.generate_otp()

        return user
    
class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, attrs):
        try:
            user = User.objects.get(email=attrs["email"])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid Email.")
        
        try:
            otp_obj = EmailOTPRepository.get_by_user(user)
        except EmailOTP.DoesNotExist:
            raise serializers.ValidationError("OTP not found.")
        
        if otp_obj.is_expired():
            raise serializers.ValidationError("OTP expired.")
        
        if otp_obj.otp != attrs["otp"]:
            raise serializers.ValidationError("Invalid OTP.")
        
        attrs["user"] = user
        return attrs
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            user = User.objects.get(username=attrs["username"])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid username.")

        user = authenticate(username=user.username, password=attrs["password"])

        if not user:
            raise serializers.ValidationError("Invalid credentials.")

        if not user.is_active:
            raise serializers.ValidationError("Account not verified.")

        attrs["user"] = user
        return attrs