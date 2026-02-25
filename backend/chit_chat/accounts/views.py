from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate

from .serializers import RegisterSerializer, VerifyOTPSerializer
from .repository.emailOTP_repository import EmailOTPRepository
from .utils import send_otp_email
# Create your views here.

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        otp_obj = EmailOTPRepository.get_by_user(user=user)
        send_otp_email(user, otp_obj.otp)

        return Response({"message": "User registered. Please verify OTP sent to email."},
                        status=status.HTTP_201_CREATED
        )
    
class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data["user"]
        user.is_active = True
        user.save(update_fields=['is_active'])

        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        response = Response(
            {"message": "Account verified successfully."},
            status=status.HTTP_200_OK,
        )

        response.set_cookie(
            key="access_token",
            value=str(access_token),
            httponly=True,
            secure=False,
            samesite="Lax",
        )

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax", 
        )

        return response