from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APITestCase
from apps.core.test_helpers import make_customer, make_verified_provider, make_service
from apps.bookings.models import Booking


class ReviewTests(APITestCase):
    def setUp(self):
        self.customer = make_customer()
        self.provider = make_verified_provider()
        self.service = make_service(self.provider)
        self.booking = Booking.objects.create(
            customer=self.customer, service=self.service,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=1),
        )

    def _complete_booking(self):
        self.booking.confirm()
        self.booking.complete()
        self.booking.save()

    def test_cannot_review_non_completed_booking(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.post('/api/reviews/', {'booking': self.booking.id, 'rating': 5})
        self.assertEqual(res.status_code, 400)

    def test_can_review_completed_booking(self):
        self._complete_booking()
        self.client.force_authenticate(user=self.customer)
        res = self.client.post('/api/reviews/', {
            'booking': self.booking.id, 'rating': 5, 'comment': 'Great work',
        })
        self.assertEqual(res.status_code, 201)

    def test_cannot_review_same_booking_twice(self):
        self._complete_booking()
        self.client.force_authenticate(user=self.customer)
        self.client.post('/api/reviews/', {'booking': self.booking.id, 'rating': 5})
        res = self.client.post('/api/reviews/', {'booking': self.booking.id, 'rating': 3})
        self.assertEqual(res.status_code, 400)

    def test_cannot_review_someone_elses_booking(self):
        other = make_customer(username='other')
        self._complete_booking()
        self.client.force_authenticate(user=other)
        res = self.client.post('/api/reviews/', {'booking': self.booking.id, 'rating': 5})
        self.assertEqual(res.status_code, 400)

    def test_rating_out_of_range_rejected(self):
        self._complete_booking()
        self.client.force_authenticate(user=self.customer)
        res = self.client.post('/api/reviews/', {'booking': self.booking.id, 'rating': 9})
        self.assertEqual(res.status_code, 400)