from apps.users.models import User
from apps.providers.models import Provider
from apps.services.models import Service, ServiceCategory


def make_customer(username='customer1', password='testpass123'):
    return User.objects.create_user(username=username, password=password, user_type='customer')


def make_verified_provider(username='provider1', password='testpass123'):
    user = User.objects.create_user(username=username, password=password, user_type='provider')
    provider = Provider.objects.create(user=user, business_name=f'{username} biz')
    provider.submit_for_review()
    provider.verify()
    provider.save()
    return provider


def make_service(provider, title='Test Service', price='100.00', duration=60):
    category, _ = ServiceCategory.objects.get_or_create(name='General', slug='general')
    service = Service.objects.create(
        provider=provider, category=category,
        title=title, base_price=price, duration_minutes=duration,
    )
    service.refresh_from_db()  # base_price was set from a str; reload to get a real Decimal
    return service