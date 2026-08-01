from rest_framework import serializers
from .models import Booking
from apps.services.models import Service


class BookingSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source='service.title', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'service', 'service_title', 'start_time', 'end_time',
            'status', 'notes', 'created_at',
        ]
        read_only_fields = ['status']

    def create(self, validated_data):
        # customer comes from the logged-in user, never from the request body —
        # otherwise anyone could book on someone else's behalf
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)