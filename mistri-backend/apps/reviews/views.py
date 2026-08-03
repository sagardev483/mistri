from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer


class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProviderReviewsListView(generics.ListAPIView):
    """Public — reviews for a given provider's services."""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        provider_id = self.kwargs['provider_id']
        return Review.objects.filter(
            booking__service__provider_id=provider_id
        ).select_related('booking__service')