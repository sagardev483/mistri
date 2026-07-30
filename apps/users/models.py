from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class UserType(models.TextChoices):
        CUSTOMER = 'customer', 'Customer'
        PROVIDER = 'provider', 'Provider'

    user_type = models.CharField(
        max_length=20,
        choices=UserType.choices,
        default=UserType.CUSTOMER,
    )
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.username