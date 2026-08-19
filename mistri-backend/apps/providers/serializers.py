from rest_framework import serializers
from .models import Provider


class ProviderSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = Provider
        fields = [
            'id', 'username', 'business_name', 'bio',
            'years_experience', 'verification_status', 'created_at',
            'latitude', 'longitude', 'distance_km',
        ]
        read_only_fields = fields

    def get_latitude(self, obj):
        return obj.location.y if obj.location else None

    def get_longitude(self, obj):
        return obj.location.x if obj.location else None

    def get_distance_km(self, obj):
        # Only present when the queryset was annotated with .annotate(distance=...),
        # i.e. only on NearbyProvidersView. Plain ProviderListView rows just get None here.
        distance = getattr(obj, 'distance', None)
        return round(distance.km, 2) if distance is not None else None


class ProviderProfileSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(write_only=True, required=False)
    longitude = serializers.FloatField(write_only=True, required=False)

    class Meta:
        model = Provider
        fields = [
            'id', 'business_name', 'bio', 'years_experience',
            'verification_status', 'latitude', 'longitude',
        ]
        read_only_fields = ['id', 'verification_status']

    def create(self, validated_data):
        return self._set_location(Provider(**self._pop_coords(validated_data)), validated_data)

    def update(self, instance, validated_data):
        return self._set_location(instance, validated_data, is_update=True)

    def _pop_coords(self, validated_data):
        validated_data.pop('latitude', None)
        validated_data.pop('longitude', None)
        return validated_data

    def _set_location(self, instance, validated_data, is_update=False):
        from django.contrib.gis.geos import Point
        lat = validated_data.pop('latitude', None)
        lng = validated_data.pop('longitude', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if lat is not None and lng is not None:
            instance.location = Point(lng, lat, srid=4326)
        instance.save()
        return instance