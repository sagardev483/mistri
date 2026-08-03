from django.urls import path
from .views import (
    BookingCreateView, MyBookingsListView, ProviderBookingsListView,
    ConfirmBookingView, DeclineBookingView, CompleteBookingView, CancelBookingView,
)

urlpatterns = [
    path('', BookingCreateView.as_view(), name='booking-create'),
    path('mine/', MyBookingsListView.as_view(), name='booking-mine'),
    path('provider/', ProviderBookingsListView.as_view(), name='booking-provider'),
    path('<int:pk>/confirm/', ConfirmBookingView.as_view(), name='booking-confirm'),
    path('<int:pk>/decline/', DeclineBookingView.as_view(), name='booking-decline'),
    path('<int:pk>/complete/', CompleteBookingView.as_view(), name='booking-complete'),
    path('<int:pk>/cancel/', CancelBookingView.as_view(), name='booking-cancel'),
]