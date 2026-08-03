from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Service
from .serializers import ServiceSerializer, ServiceManageSerializer
from apps.providers.models import Provider


class ServiceListView(generics.ListAPIView):
    """Public, read-only. Anyone can browse active services — no login required."""
    queryset = Service.objects.filter(is_active=True).select_related('provider', 'category')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


class IsVerifiedProvider(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'provider_profile')
            and request.user.provider_profile.verification_status == Provider.VerificationStatus.VERIFIED
        )


class MyServiceListCreateView(generics.ListCreateAPIView):
    """List your own services (active + inactive) / create a new one.
    Only verified providers may create services.
    """
    serializer_class = ServiceManageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Service.objects.filter(provider=self.request.user.provider_profile)

    def perform_create(self, serializer):
        if not IsVerifiedProvider().has_permission(self.request, self):
            raise PermissionDenied('Only verified providers can create services.')
        serializer.save(provider=self.request.user.provider_profile)


class MyServiceDetailView(generics.RetrieveUpdateAPIView):
    """Update your own service (including deactivating it). Cannot touch others'."""
    serializer_class = ServiceManageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # scoping the queryset to the owner means a mismatched pk returns
        # a clean 404 instead of a 403 — doesn't leak that the service exists
        return Service.objects.filter(provider=self.request.user.provider_profile)