from django.apps import AppConfig


# apps/bookings/apps.py
class BookingsConfig(AppConfig):
    name = 'apps.bookings'

    def ready(self):
        import apps.bookings.signals  # noqa: F401