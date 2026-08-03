from rest_framework import serializers
from .models import Service, ServiceCategory


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'slug']


class ServiceSerializer(serializers.ModelSerializer):
    category = ServiceCategorySerializer(read_only=True)
    provider_name = serializers.CharField(source='provider.business_name', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'title', 'description', 'base_price',
            'duration_minutes', 'category', 'provider', 'provider_name',
        ]


class ServiceManageSerializer(serializers.ModelSerializer):
    """Used by a provider to create/update their own services.
    'provider' is never accepted from the client — it's set in the view
    from request.user.provider_profile, same pattern as Booking.customer.
    category is passed as a plain PK (category_id) for writes.
    """
    class Meta:
        model = Service
        fields = [
            'id', 'title', 'description', 'base_price',
            'duration_minutes', 'category', 'is_active',
        ]
        read_only_fields = ['id']