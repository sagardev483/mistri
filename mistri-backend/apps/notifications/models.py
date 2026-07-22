# apps/notifications/models.py
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        BOOKING_CONFIRMED = 'booking_confirmed', 'Booking Confirmed'
        BOOKING_DECLINED = 'booking_declined', 'Booking Declined'
        BOOKING_CANCELLED = 'booking_cancelled', 'Booking Cancelled'
        PAYMENT_CAPTURED = 'payment_captured', 'Payment Captured'
        PAYMENT_FAILED = 'payment_failed', 'Payment Failed'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    notification_type = models.CharField(max_length=30, choices=Type.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()

    # Generic relation: lets a Notification point at a Booking today,
    # a Payment tomorrow, a Review after that — without a separate
    # nullable FK column for every model we might ever notify about.
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('content_type', 'object_id')

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} -> {self.recipient.username}"