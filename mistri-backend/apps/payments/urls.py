from django.urls import path
from .views import MyPaymentsListView, PaymentCaptureView, PaymentRefundView, ProviderEarningsSummaryView

urlpatterns = [
    path('mine/', MyPaymentsListView.as_view(), name='payment-mine'),
    path('provider/summary/', ProviderEarningsSummaryView.as_view(), name='payment-provider-summary'),
    path('<int:pk>/capture/', PaymentCaptureView.as_view(), name='payment-capture'),
    path('<int:pk>/refund/', PaymentRefundView.as_view(), name='payment-refund'),
]