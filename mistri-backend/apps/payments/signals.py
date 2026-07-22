# apps/payments/signals.py
from django.dispatch import receiver
from django_fsm.signals import post_transition
from .models import Payment
from apps.notifications.models import Notification
from apps.notifications.services import notify


@receiver(post_transition, sender=Payment)
def payment_transitioned(sender, instance, name, source, target, **kwargs):
    if name == 'capture':
        notify(recipient=instance.booking.customer,
               notification_type=Notification.Type.PAYMENT_CAPTURED,
               title='Payment successful',
               message=f"Your payment of {instance.amount} {instance.currency} was received.",
               related_object=instance)
    elif name == 'fail':
        notify(recipient=instance.booking.customer,
               notification_type=Notification.Type.PAYMENT_FAILED,
               title='Payment failed',
               message="Your payment could not be processed. Please try again.",
               related_object=instance)