from django.urls import path
from .views import (
    ProviderListView, ProviderDetailView,
    MyProviderProfileView, SubmitForReviewView,
)

urlpatterns = [
    path('', ProviderListView.as_view(), name='provider-list'),
    path('me/', MyProviderProfileView.as_view(), name='provider-me'),
    path('me/submit-for-review/', SubmitForReviewView.as_view(), name='provider-submit-review'),
    path('<int:pk>/', ProviderDetailView.as_view(), name='provider-detail'),
]