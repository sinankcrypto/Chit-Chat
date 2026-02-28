from ..models import EmailOTP

class EmailOTPRepository:
    @staticmethod
    def get_or_create_by_user(user):
        return EmailOTP.objects.get_or_create(user=user)
    
    @staticmethod
    def get_by_user(user):
        return EmailOTP.objects.get(user=user)