from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random
# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.username
    
class EmailOTP(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_otp(self):
        self.otp = str(random.randint(100000, 999999))
        self.created_at = timezone.now()
        self.save()

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=10)