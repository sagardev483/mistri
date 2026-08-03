from rest_framework import serializers
from .models import Booking
from apps.services.models import Service


class BookingSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source='service.title', read_only=True)
    customer_username = serializers.CharField(source='customer.username', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'service', 'service_title', 'customer_username',
            'start_time', 'end_time', 'status', 'notes', 'created_at',
        ]
        read_only_fields = ['status']

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)