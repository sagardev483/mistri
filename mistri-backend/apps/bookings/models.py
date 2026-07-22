from django.conf import settings
from django.db import models
from django_fsm import FSMField, transition
from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields import RangeOperators
from django.db.models import Q


class Booking(models.Model):
    class Status(models.TextChoices):
        REQUESTED = 'requested', 'Requested'
        CONFIRMED = 'confirmed', 'Confirmed'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        DECLINED = 'declined', 'Declined'

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings_made',
    )
    service = models.ForeignKey(
        'services.Service',
        on_delete=models.PROTECT,
        related_name='bookings',
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    status = FSMField(
        default=Status.REQUESTED,
        choices=Status.choices,
        protected=True,
    )

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_time']
    class Meta:
        ordering = ['-start_time']
        constraints = [
            ExclusionConstraint(
                name='exclude_overlapping_bookings',
                expressions=[
                    ('service', RangeOperators.EQUAL),
                    (
                        models.Func(
                            'start_time', 'end_time',
                            function='tstzrange',
                        ),
                        RangeOperators.OVERLAPS,
                    ),
                ],
                condition=Q(status__in=['requested', 'confirmed']),
            ),
        ]

    def __str__(self):
        return f"{self.service.title} for {self.customer.username} @ {self.start_time}"

    # --- Transitions ---

    @transition(field=status, source=Status.REQUESTED, target=Status.CONFIRMED)
    def confirm(self):
        pass

    @transition(field=status, source=Status.REQUESTED, target=Status.DECLINED)
    def decline(self):
        pass

    @transition(field=status, source=Status.CONFIRMED, target=Status.COMPLETED)
    def complete(self):
        pass

    @transition(field=status,
                source=[Status.REQUESTED, Status.CONFIRMED],
                target=Status.CANCELLED)
    def cancel(self):
        pass