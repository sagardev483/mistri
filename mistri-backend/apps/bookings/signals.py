# apps/bookings/signals.py
from django.dispatch import receiver
from django_fsm.signals import post_transition
from .models import Booking
from apps.notifications.models import Notification
from apps.notifications.services import notify


@receiver(post_transition, sender=Booking)
def booking_transitioned(sender, instance, name, source, target, **kwargs):
    messages = {
        'confirm': (Notification.Type.BOOKING_CONFIRMED, 'Booking confirmed',
                    f"Your booking for {instance.service.title} on {instance.start_time} was confirmed."),
        'decline': (Notification.Type.BOOKING_DECLINED, 'Booking declined',
                    f"Your booking for {instance.service.title} was declined."),
        'cancel': (Notification.Type.BOOKING_CANCELLED, 'Booking cancelled',
                   f"Your booking for {instance.service.title} was cancelled."),
    }
    if name in messages:
        notif_type, title, message = messages[name]
        notify(recipient=instance.customer, notification_type=notif_type,
               title=title, message=message, related_object=instance)