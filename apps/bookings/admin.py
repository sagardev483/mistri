from django.contrib import admin
from .models import Booking, BookingStatusHistory


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('service', 'customer', 'start_time', 'end_time', 'status')
    list_filter = ('status',)
    
@admin.register(BookingStatusHistory)
class BookingStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('booking', 'from_status', 'to_status', 'changed_by', 'changed_at')
    list_filter = ('to_status',)