from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.services.models import ServiceCategory

User = get_user_model()


class Command(BaseCommand):
    help = "Seed the baseline data e2e tests depend on. Safe to run repeatedly."

    def handle(self, *args, **options):
        ServiceCategory.objects.get_or_create(
            slug='general-e2e', defaults={'name': 'General (E2E)'}
        )

        if not User.objects.filter(username='e2e_admin').exists():
            User.objects.create_superuser(
                username='e2e_admin', email='e2e_admin@example.com', password='e2e_admin_pass'
            )
            self.stdout.write(self.style.SUCCESS('Created e2e_admin superuser'))
        else:
            self.stdout.write('e2e_admin already exists')

        self.stdout.write(self.style.SUCCESS('E2E seed complete'))