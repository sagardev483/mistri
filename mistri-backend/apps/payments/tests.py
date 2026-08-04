from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APITestCase
from apps.core.test_helpers import make_customer, make_verified_provider, make_service
from apps.bookings.models import Booking
from apps.payments.models import Payment


class PaymentCaptureTests(APITestCase):
    def setUp(self):
        self.customer = make_customer()
        self.provider = make_verified_provider()
        self.service = make_service(self.provider)
        self.booking = Booking.objects.create(
            customer=self.customer, service=self.service,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=1),
        )
        # We call the model transition directly here (not the confirm
        # endpoint), so we create the Payment ourselves — the "confirm
        # actually creates a Payment" behavior is already covered in
        # BookingTransitionPermissionTests.test_confirming_creates_a_payment
        self.booking.confirm()
        self.booking.save()
        self.payment = Payment.objects.create(booking=self.booking, amount=self.service.base_price)

    def test_customer_can_capture_own_payment(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.post(f'/api/payments/{self.payment.id}/capture/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['status'], 'captured')

    def test_other_customer_cannot_capture(self):
        other = make_customer(username='other')
        self.client.force_authenticate(user=other)
        res = self.client.post(f'/api/payments/{self.payment.id}/capture/')
        self.assertEqual(res.status_code, 404)

    def test_provider_can_refund_captured_payment(self):
        self.payment.authorize()
        self.payment.capture()
        self.payment.save()
        self.client.force_authenticate(user=self.provider.user)
        res = self.client.post(f'/api/payments/{self.payment.id}/refund/')
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['status'], 'refunded')