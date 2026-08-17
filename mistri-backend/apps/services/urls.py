from django.urls import path
from .views import ServiceListView, ServiceCategoryListView, MyServiceListCreateView, MyServiceDetailView

urlpatterns = [
    path('', ServiceListView.as_view(), name='service-list'),
    path('categories/', ServiceCategoryListView.as_view(), name='service-category-list'),
    path('mine/', MyServiceListCreateView.as_view(), name='service-mine'),
    path('mine/<int:pk>/', MyServiceDetailView.as_view(), name='service-mine-detail'),
]