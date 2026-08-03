from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_fsm import TransitionNotAllowed
from .models import Provider
from .serializers import ProviderSerializer, ProviderProfileSerializer


class IsProviderUser(permissions.BasePermission):
    """Only users registered with user_type='provider' may create/manage a Provider profile."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.user_type == 'provider'
        )


class ProviderListView(generics.ListAPIView):
    """Public. Only verified providers are discoverable by customers."""
    queryset = Provider.objects.filter(verification_status=Provider.VerificationStatus.VERIFIED)
    serializer_class = ProviderSerializer
    permission_classes = [permissions.AllowAny]


class ProviderDetailView(generics.RetrieveAPIView):
    """Public. Single provider's profile page."""
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    permission_classes = [permissions.AllowAny]


class MyProviderProfileView(APIView):
    """GET: view your own profile. POST: create it (once). PATCH: update it."""
    permission_classes = [IsProviderUser]

    def get(self, request):
        try:
            provider = request.user.provider_profile
        except Provider.DoesNotExist:
            return Response({'detail': 'No provider profile yet. POST to create one.'}, status=404)
        return Response(ProviderProfileSerializer(provider).data)

    def post(self, request):
        if hasattr(request.user, 'provider_profile'):
            return Response({'detail': 'Provider profile already exists.'}, status=400)
        serializer = ProviderProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request):
        try:
            provider = request.user.provider_profile
        except Provider.DoesNotExist:
            return Response({'detail': 'No provider profile yet.'}, status=404)
        serializer = ProviderProfileSerializer(provider, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SubmitForReviewView(APIView):
    """Triggers the pending -> under_review FSM transition."""
    permission_classes = [IsProviderUser]

    def post(self, request):
        try:
            provider = request.user.provider_profile
        except Provider.DoesNotExist:
            return Response({'detail': 'No provider profile yet.'}, status=404)
        try:
            provider.submit_for_review()
        except TransitionNotAllowed:
            return Response(
                {'detail': f'Cannot submit for review from status "{provider.verification_status}".'},
                status=400,
            )
        provider.save()
        return Response(ProviderProfileSerializer(provider).data)