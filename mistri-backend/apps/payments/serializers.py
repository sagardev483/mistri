from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'amount', 'currency',
            'status', 'gateway', 'gateway_reference', 'created_at',
        ]
        read_only_fields = fields  # payments are never edited directly by clients