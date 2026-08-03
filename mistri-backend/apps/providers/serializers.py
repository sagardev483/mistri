from rest_framework import serializers
from .models import Provider


class ProviderSerializer(serializers.ModelSerializer):
    """Public-facing view of a provider — used for browsing and detail pages."""
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Provider
        fields = [
            'id', 'username', 'business_name', 'bio',
            'years_experience', 'verification_status', 'created_at',
        ]
        read_only_fields = fields


class ProviderProfileSerializer(serializers.ModelSerializer):
    """Used by a provider to create/update their own profile.
    verification_status is intentionally excluded from writable fields —
    it only changes via FSM transitions (submit_for_review, verify, reject).
    """
    class Meta:
        model = Provider
        fields = ['id', 'business_name', 'bio', 'years_experience', 'verification_status']
        read_only_fields = ['id', 'verification_status']