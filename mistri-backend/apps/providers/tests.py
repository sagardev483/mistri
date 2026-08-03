from rest_framework.test import APITestCase
from apps.core.test_helpers import make_customer
from apps.users.models import User
from apps.providers.models import Provider


class ProviderProfileTests(APITestCase):
    def setUp(self):
        self.provider_user = User.objects.create_user(
            username='provider1', password='testpass123', user_type='provider'
        )
        self.customer_user = make_customer()

    def test_customer_cannot_create_provider_profile(self):
        self.client.force_authenticate(user=self.customer_user)
        res = self.client.post('/api/providers/me/', {'business_name': 'Nope'})
        self.assertEqual(res.status_code, 403)

    def test_provider_can_create_and_submit_for_review(self):
        self.client.force_authenticate(user=self.provider_user)
        res = self.client.post('/api/providers/me/', {'business_name': 'My Biz'})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['verification_status'], 'pending')

        res = self.client.post('/api/providers/me/submit-for-review/')
        self.assertEqual(res.data['verification_status'], 'under_review')

    def test_cannot_submit_for_review_twice(self):
        self.client.force_authenticate(user=self.provider_user)
        self.client.post('/api/providers/me/', {'business_name': 'My Biz'})
        self.client.post('/api/providers/me/submit-for-review/')
        res = self.client.post('/api/providers/me/submit-for-review/')
        self.assertEqual(res.status_code, 400)

    def test_verification_status_cannot_be_set_directly(self):
        self.client.force_authenticate(user=self.provider_user)
        res = self.client.post('/api/providers/me/', {
            'business_name': 'My Biz', 'verification_status': 'verified',
        })
        self.assertEqual(res.data['verification_status'], 'pending')

    def test_non_staff_cannot_admin_verify(self):
        provider = Provider.objects.create(user=self.provider_user, business_name='Biz')
        self.client.force_authenticate(user=self.customer_user)
        res = self.client.post(f'/api/providers/{provider.id}/admin-verify/')
        self.assertEqual(res.status_code, 403)

    def test_staff_can_admin_verify_under_review_provider(self):
        provider = Provider.objects.create(user=self.provider_user, business_name='Biz')
        provider.submit_for_review()
        provider.save()
        staff = User.objects.create_user(username='staffuser', password='x', is_staff=True)
        self.client.force_authenticate(user=staff)
        res = self.client.post(f'/api/providers/{provider.id}/admin-verify/')
        self.assertEqual(res.data['verification_status'], 'verified')