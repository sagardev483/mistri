from django.urls import path
from .views import ReviewCreateView, ProviderReviewsListView

urlpatterns = [
    path('', ReviewCreateView.as_view(), name='review-create'),
    path('provider/<int:provider_id>/', ProviderReviewsListView.as_view(), name='review-provider-list'),
]