from django.contrib import admin, messages
from django.contrib.gis.admin import GISModelAdmin
from .models import Provider


@admin.register(Provider)
class ProviderAdmin(GISModelAdmin):
    list_display = ('user', 'business_name', 'verification_status', 'created_at')
    list_filter = ('verification_status',)
    search_fields = ('user__username', 'business_name')
    readonly_fields = ('verification_status',)
    actions = ['action_verify', 'action_reject', 'action_suspend', 'action_reinstate']

    @admin.action(description='Verify selected providers')
    def action_verify(self, request, queryset):
        count = 0
        for provider in queryset:
            if provider.verification_status == Provider.VerificationStatus.UNDER_REVIEW:
                provider.verify()
                provider.save()
                count += 1
        self.message_user(request, f"{count} provider(s) verified.", messages.SUCCESS)

    @admin.action(description='Reject selected providers')
    def action_reject(self, request, queryset):
        count = 0
        for provider in queryset:
            if provider.verification_status == Provider.VerificationStatus.UNDER_REVIEW:
                provider.reject()
                provider.save()
                count += 1
        self.message_user(request, f"{count} provider(s) rejected.", messages.SUCCESS)

    @admin.action(description='Suspend selected providers')
    def action_suspend(self, request, queryset):
        count = 0
        for provider in queryset:
            if provider.verification_status == Provider.VerificationStatus.VERIFIED:
                provider.suspend()
                provider.save()
                count += 1
        self.message_user(request, f"{count} provider(s) suspended.", messages.SUCCESS)

    @admin.action(description='Reinstate selected providers')
    def action_reinstate(self, request, queryset):
        count = 0
        for provider in queryset:
            if provider.verification_status == Provider.VerificationStatus.SUSPENDED:
                provider.reinstate()
                provider.save()
                count += 1
        self.message_user(request, f"{count} provider(s) reinstated.", messages.SUCCESS)