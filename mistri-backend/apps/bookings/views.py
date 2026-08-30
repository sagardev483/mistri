from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django_fsm import TransitionNotAllowed
from .models import Booking
from .serializers import BookingSerializer
from apps.payments.models import Payment


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyBookingsListView(generics.ListAPIView):
    """Customer's own bookings."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(customer=self.request.user).select_related('service', 'review')


class ProviderBookingsListView(generics.ListAPIView):
    """Bookings made against the logged-in provider's own services."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, 'provider_profile'):
            return Booking.objects.none()
        return Booking.objects.filter(
            service__provider=self.request.user.provider_profile
        ).select_related('service', 'customer')



class BookingTransitionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    transition_name = None
    allowed_role = None
    creates_payment = False   # <-- new flag, only True for ConfirmBookingView

    def _is_allowed(self, request, booking):
        if self.allowed_role == 'provider':
            return (
                hasattr(request.user, 'provider_profile')
                and booking.service.provider_id == request.user.provider_profile.id
            )
        if self.allowed_role == 'customer':
            return booking.customer_id == request.user.id
        return False

    def _extra_validation(self, booking):
        """Optional hook for subclasses: return an error message to block
        the transition with a 400, or None to let it proceed. Runs after
        the permission check, before the FSM transition is attempted."""
        return None

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk)

        if not self._is_allowed(request, booking):
            return Response(
                {'detail': 'You are not allowed to perform this action on this booking.'},
                status=403,
            )

        error = self._extra_validation(booking)
        if error:
            return Response({'detail': error}, status=400)

        booking._changed_by = request.user
        transition = getattr(booking, self.transition_name)
        try:
            transition()
        except TransitionNotAllowed:
            return Response(
                {'detail': f'Cannot {self.transition_name} a booking with status "{booking.status}".'},
                status=400,
            )
        booking.save()

        if self.creates_payment and not booking.payments.exists():
            Payment.objects.create(
                booking=booking,
                amount=booking.service.base_price,
            )

        return Response(BookingSerializer(booking).data)


class ConfirmBookingView(BookingTransitionView):
    transition_name = 'confirm'
    allowed_role = 'provider'
    creates_payment = True


class DeclineBookingView(BookingTransitionView):
    transition_name = 'decline'
    allowed_role = 'provider'


class CompleteBookingView(BookingTransitionView):
    transition_name = 'complete'
    allowed_role = 'provider'

    def _extra_validation(self, booking):
        if not booking.payments.filter(status=Payment.Status.CAPTURED).exists():
            return 'Cannot mark complete until the customer has paid.'
        return None


class CancelBookingView(BookingTransitionView):
    transition_name = 'cancel'
    allowed_role = 'customer'