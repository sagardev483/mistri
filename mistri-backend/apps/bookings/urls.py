from django.urls import path
from .views import BookingCreateView, MyBookingsListView

urlpatterns = [
    path('', BookingCreateView.as_view(), name='booking-create'),
    path('mine/', MyBookingsListView.as_view(), name='booking-mine'),
]