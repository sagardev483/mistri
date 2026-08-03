from django.urls import path
from .views import ServiceListView, MyServiceListCreateView, MyServiceDetailView

urlpatterns = [
    path('', ServiceListView.as_view(), name='service-list'),
    path('mine/', MyServiceListCreateView.as_view(), name='service-mine'),
    path('mine/<int:pk>/', MyServiceDetailView.as_view(), name='service-mine-detail'),
]