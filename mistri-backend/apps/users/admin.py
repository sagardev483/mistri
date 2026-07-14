from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Mistri Profile', {'fields': ('user_type', 'phone_number')}),
    )
    list_display = ('username', 'email', 'user_type', 'is_staff')


admin.site.register(User, CustomUserAdmin)