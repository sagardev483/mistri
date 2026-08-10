from datetime import timedelta
from django.utils import timezone
from django.db import IntegrityError, transaction
from rest_framework.test import APITestCase
from apps.core.test_helpers import make_customer, make_verified_provider, make_service
from apps.bookings.models import Booking
from apps.payments.models import Payment

""" never call .refresh_from_db() on Booking, Payment, or Provider (all three have protected FSM fields) 
— always re-fetch instead."""
class BookingOverlapConstraintTests(APITestCase):
    """
    Proves the database-level ExclusionConstraint actually rejects
    overlapping bookings — this is the one piece of logic Python
    code review can't verify by reading the model.
    """

    def setUp(self):
        self.customer = make_customer()
        self.provider = make_verified_provider()
        self.service = make_service(self.provider)
        self.start = timezone.now() + timedelta(days=1)
        self.end = self.start + timedelta(hours=1)

    def test_overlapping_booking_rejected_at_db_level(self):
        Booking.objects.create(
            customer=self.customer, service=self.service,
            start_time=self.start, end_time=self.end,
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Booking.objects.create(
                    customer=self.customer, service=self.service,
                    start_time=self.start + timedelta(minutes=30),
                    end_time=self.end + timedelta(minutes=30),
                )

    def test_non_overlapping_booking_allowed(self):
        Booking.objects.create(
            customer=self.customer, service=self.service,
            start_time=self.start, end_time=self.end,
        )
        Booking.objects.create(
            customer=self.customer, service=self.service,
            start_time=self.end, end_time=self.end + timedelta(hours=1),
        )
        self.assertEqual(Booking.objects.count(), 2)

    def test_cancelled_booking_does_not_block_new_overlapping_booking(self):
        booking = Booking.objects.create(
            customer=self.customer, service=self.service,
            start_time=self.start, end_time=self.end,
        )
        booking.cancel()
        booking.save()
        Booking.objects.create(
            customer=self.customer, service=self.service,
            start_time=self.start, end_time=self.end,
        )
        self.assertEqual(Booking.objects.filter(service=self.service).count(), 2)


class BookingTransitionPermissionTests(APITestCase):
    """Confirms role-gating: providers act on their own bookings,
    customers act on their own — never across the boundary."""

    def setUp(self):
        self.customer = make_customer()
        self.provider = make_verified_provider()
        self.service = make_service(self.provider)
        self.booking = Booking.objects.create(
            customer=self.customer, service=self.service,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=1),
        )

    def test_provider_can_confirm_own_booking(self):
        self.client.force_authenticate(user=self.provider.user)
        res = self.client.post(f'/api/bookings/{self.booking.id}/confirm/')
        self.assertEqual(res.status_code, 200)
        refreshed = Booking.objects.get(pk=self.booking.pk)
        self.assertEqual(refreshed.status, Booking.Status.CONFIRMED)

    def test_confirming_creates_a_payment(self):
        self.client.force_authenticate(user=self.provider.user)
        res = self.client.post(f'/api/bookings/{self.booking.id}/confirm/')
        self.assertEqual(res.status_code, 200, res.data)  # <-- shows the error body if this fails
        payment = Payment.objects.get(booking=self.booking)
        self.assertEqual(payment.amount, self.service.base_price)

    def test_confirming_twice_is_rejected(self):
        self.client.force_authenticate(user=self.provider.user)
        self.client.post(f'/api/bookings/{self.booking.id}/confirm/')
        res = self.client.post(f'/api/bookings/{self.booking.id}/confirm/')
        self.assertEqual(res.status_code, 400)

    def test_customer_cannot_confirm_own_booking(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.post(f'/api/bookings/{self.booking.id}/confirm/')
        self.assertEqual(res.status_code, 403)

    def test_other_provider_cannot_confirm_this_booking(self):
        other_provider = make_verified_provider(username='other_provider')
        self.client.force_authenticate(user=other_provider.user)
        res = self.client.post(f'/api/bookings/{self.booking.id}/confirm/')
        self.assertEqual(res.status_code, 403)

    def test_customer_can_cancel_own_booking(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.post(f'/api/bookings/{self.booking.id}/cancel/')
        self.assertEqual(res.status_code, 200)

    def test_other_customer_cannot_cancel_this_booking(self):
        other = make_customer(username='other_customer')
        self.client.force_authenticate(user=other)
        res = self.client.post(f'/api/bookings/{self.booking.id}/cancel/')
        self.assertEqual(res.status_code, 403)
        
    def test_confirm_endpoint_creates_payment_with_correct_amount(self):
        """Guards against the ConfirmBookingView duplicate-class regression —
        confirming via the actual API endpoint must create a Payment."""
        self.client.force_authenticate(user=self.provider.user)
        res = self.client.post(f'/api/bookings/{self.booking.id}/confirm/')
        self.assertEqual(res.status_code, 200, res.data)
        payment = Payment.objects.get(booking=self.booking)
        self.assertEqual(payment.amount, self.service.base_price)
        self.assertEqual(payment.status, Payment.Status.PENDING)