from django.core.mail import send_mail
from django.conf import settings


def send_otp_email(user, otp):
    subject = "Your OTP Verification Code"
    message = f"""
    Hello {user.username},

    Your OTP code is: {otp}

    It expires in 10 minutes.
    """

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )