from rest_framework import serializers
from .models import Review
from apps.bookings.models import Booking


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'booking', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_booking(self, booking):
        request = self.context['request']
        if booking.customer_id != request.user.id:
            raise serializers.ValidationError("This isn't your booking.")
        if booking.status != Booking.Status.COMPLETED:
            raise serializers.ValidationError("You can only review a completed booking.")
        if hasattr(booking, 'review'):
            raise serializers.ValidationError("This booking already has a review.")
        return booking