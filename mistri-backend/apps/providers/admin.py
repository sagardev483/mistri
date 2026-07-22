from django.contrib import admin
from .models import Provider


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ('user', 'business_name', 'verification_status', 'created_at')
    list_filter = ('verification_status',)
    search_fields = ('user__username', 'business_name')