from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django_fsm import TransitionNotAllowed
from .models import Payment
from .serializers import PaymentSerializer


class MyPaymentsListView(generics.ListAPIView):
    """Customer's own payment history."""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(booking__customer=self.request.user)


class PaymentCaptureView(APIView):
    """
    'Pay now' — customer triggers this on a payment already created
    (via booking confirmation). Mock gateway: authorize + capture happen
    together for simplicity in dev.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        payment = get_object_or_404(Payment, pk=pk, booking__customer=request.user)
        try:
            if payment.status == Payment.Status.PENDING:
                payment.authorize()
            payment.capture()
        except TransitionNotAllowed:
            return Response(
                {'detail': f'Cannot capture a payment with status "{payment.status}".'},
                status=400,
            )
        payment.save()
        return Response(PaymentSerializer(payment).data)


class PaymentRefundView(APIView):
    """Provider-initiated refund (e.g. after a dispute)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        payment = get_object_or_404(
            Payment, pk=pk, booking__service__provider__user=request.user
        )
        try:
            payment.refund()
        except TransitionNotAllowed:
            return Response(
                {'detail': f'Cannot refund a payment with status "{payment.status}".'},
                status=400,
            )
        payment.save()
        return Response(PaymentSerializer(payment).data)