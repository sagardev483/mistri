# apps/payments/models.py
from django.conf import settings
from django.db import models
from django_fsm import FSMField, transition


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        AUTHORIZED = 'authorized', 'Authorized'
        CAPTURED = 'captured', 'Captured'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    class Gateway(models.TextChoices):
        MOCK = 'mock', 'Mock (dev only)'
        ESEWA = 'esewa', 'eSewa'
        KHALTI = 'khalti', 'Khalti'

    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.PROTECT,
        related_name='payments',
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='NPR')

    status = FSMField(
        default=Status.PENDING,
        choices=Status.choices,
        protected=True,
    )

    gateway = models.CharField(
        max_length=20,
        choices=Gateway.choices,
        default=Gateway.MOCK,
    )
    gateway_reference = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment #{self.id} for booking #{self.booking_id} ({self.status})"

    # --- Transitions ---

    @transition(field=status, source=Status.PENDING, target=Status.AUTHORIZED)
    def authorize(self):
        pass

    @transition(field=status,
                source=[Status.PENDING, Status.AUTHORIZED],
                target=Status.CAPTURED)
    def capture(self):
        pass

    @transition(field=status,
                source=[Status.PENDING, Status.AUTHORIZED],
                target=Status.FAILED)
    def fail(self):
        pass

    @transition(field=status, source=Status.CAPTURED, target=Status.REFUNDED)
    def refund(self):
        pass