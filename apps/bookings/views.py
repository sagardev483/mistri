from rest_framework import generics, permissions
from .models import Booking
from .serializers import BookingSerializer


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyBookingsListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(customer=self.request.user).select_related('service')