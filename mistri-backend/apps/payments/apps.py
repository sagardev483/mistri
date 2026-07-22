from django.apps import AppConfig


class PaymentsConfig(AppConfig):
    name = 'apps.payments'
    
    def ready(self):
        import apps.payments.signals  # noqa: F401