from django.urls import path
from .views import (RegisterView, VerifyOTPView, LoginView, RefreshTokenView,
                     ProtectedView, LogoutView, UserSearchView)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("verify-otp/", VerifyOTPView.as_view()),
    path("login/", LoginView.as_view()),
    path("refresh/", RefreshTokenView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("protected/", ProtectedView.as_view()),
    path("users/search/", UserSearchView.as_view()),
]