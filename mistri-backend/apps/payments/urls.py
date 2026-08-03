from django.urls import path
from .views import MyPaymentsListView, PaymentCaptureView, PaymentRefundView

urlpatterns = [
    path('mine/', MyPaymentsListView.as_view(), name='payment-mine'),
    path('<int:pk>/capture/', PaymentCaptureView.as_view(), name='payment-capture'),
    path('<int:pk>/refund/', PaymentRefundView.as_view(), name='payment-refund'),
]