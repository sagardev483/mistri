from django.urls import path
from .views import (
    ProviderListView, ProviderDetailView,
    MyProviderProfileView, SubmitForReviewView,
    AdminRejectProviderView, AdminVerifyProviderView,
    NearbyProvidersView,
)


urlpatterns = [
    path('', ProviderListView.as_view(), name='provider-list'),
    path('me/', MyProviderProfileView.as_view(), name='provider-me'),
    path('nearby/', NearbyProvidersView.as_view(), name='provider-nearby'),
    path('me/submit-for-review/', SubmitForReviewView.as_view(), name='provider-submit-review'),
    path('<int:pk>/', ProviderDetailView.as_view(), name='provider-detail'),
    path('<int:pk>/admin-verify/', AdminVerifyProviderView.as_view(), name='provider-admin-verify'),
    path('<int:pk>/admin-reject/', AdminRejectProviderView.as_view(), name='provider-admin-reject'),
]