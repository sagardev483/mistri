from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source='service.title', read_only=True)
    customer_username = serializers.CharField(source='customer.username', read_only=True)
    has_review = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'service', 'service_title', 'customer_username',
            'start_time', 'end_time', 'status', 'notes', 'created_at',
            'has_review', 'payment_status',
        ]
        read_only_fields = ['status']

    def get_has_review(self, obj):
        return hasattr(obj, 'review')

    def get_payment_status(self, obj):
        payment = obj.payments.order_by('-created_at').first()
        return payment.status if payment else None

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)