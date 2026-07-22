# apps/notifications/services.py
"""
notify() is the single entry point for informing a user of something.
Every part of the app calls this — never Notification.objects.create()
or send_mail() directly — so channels can be added/removed in one place.
"""
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification


def notify(*, recipient, notification_type, title, message, related_object=None, send_email=True):
    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        related_object=related_object,
    )

    if send_email and recipient.email:
        send_mail(
            subject=title,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient.email],
            fail_silently=True,
        )

    return notification