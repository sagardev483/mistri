from rest_framework import generics, permissions
from .models import Service
from .serializers import ServiceSerializer


class ServiceListView(generics.ListAPIView):
    """Public, read-only. Anyone can browse active services — no login required."""
    queryset = Service.objects.filter(is_active=True).select_related('provider', 'category')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]