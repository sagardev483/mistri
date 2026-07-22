from django.conf import settings
from django.db import models
from django_fsm import FSMField, transition


class Provider(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        UNDER_REVIEW = 'under_review', 'Under Review'
        VERIFIED = 'verified', 'Verified'
        REJECTED = 'rejected', 'Rejected'
        SUSPENDED = 'suspended', 'Suspended'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='provider_profile',
    )
    business_name = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    years_experience = models.PositiveIntegerField(default=0)

    verification_status = FSMField(
        default=VerificationStatus.PENDING,
        choices=VerificationStatus.choices,
        protected=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.verification_status})"

    # --- Transitions ---

    @transition(field=verification_status,
                source=VerificationStatus.PENDING,
                target=VerificationStatus.UNDER_REVIEW)
    def submit_for_review(self):
        pass

    @transition(field=verification_status,
                source=VerificationStatus.UNDER_REVIEW,
                target=VerificationStatus.VERIFIED)
    def verify(self):
        pass

    @transition(field=verification_status,
                source=VerificationStatus.UNDER_REVIEW,
                target=VerificationStatus.REJECTED)
    def reject(self):
        pass

    @transition(field=verification_status,
                source=VerificationStatus.VERIFIED,
                target=VerificationStatus.SUSPENDED)
    def suspend(self):
        pass

    @transition(field=verification_status,
                source=VerificationStatus.SUSPENDED,
                target=VerificationStatus.VERIFIED)
    def reinstate(self):
        pass