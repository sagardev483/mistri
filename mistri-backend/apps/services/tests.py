from rest_framework.test import APITestCase
from apps.core.test_helpers import make_verified_provider
from apps.users.models import User
from apps.providers.models import Provider
from apps.services.models import ServiceCategory


class ServiceManagementTests(APITestCase):
    def setUp(self):
        self.category = ServiceCategory.objects.create(name='Electrical', slug='electrical')

    def test_unverified_provider_cannot_create_service(self):
        user = User.objects.create_user(username='unverified', password='x', user_type='provider')
        Provider.objects.create(user=user, business_name='Biz')  # still 'pending'
        self.client.force_authenticate(user=user)
        res = self.client.post('/api/services/mine/', {
            'title': 'Wiring', 'base_price': '100.00',
            'duration_minutes': 30, 'category': self.category.id,
        })
        self.assertEqual(res.status_code, 403)

    def test_verified_provider_can_create_service(self):
        provider = make_verified_provider()
        self.client.force_authenticate(user=provider.user)
        res = self.client.post('/api/services/mine/', {
            'title': 'Wiring', 'base_price': '100.00',
            'duration_minutes': 30, 'category': self.category.id,
        })
        self.assertEqual(res.status_code, 201)

    def test_provider_cannot_edit_another_providers_service(self):
        provider_a = make_verified_provider(username='provider_a')
        provider_b = make_verified_provider(username='provider_b')
        self.client.force_authenticate(user=provider_a.user)
        create_res = self.client.post('/api/services/mine/', {
            'title': 'Wiring', 'base_price': '100.00',
            'duration_minutes': 30, 'category': self.category.id,
        })
        service_id = create_res.data['id']

        self.client.force_authenticate(user=provider_b.user)
        res = self.client.patch(f'/api/services/mine/{service_id}/', {'title': 'Hijacked'})
        self.assertEqual(res.status_code, 404)  # scoped queryset hides its existence