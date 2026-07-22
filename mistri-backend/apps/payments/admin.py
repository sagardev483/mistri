# apps/payments/admin.py
from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'amount', 'currency', 'status', 'gateway', 'created_at')
    list_filter = ('status', 'gateway')
    search_fields = ('booking__customer__username', 'gateway_reference')