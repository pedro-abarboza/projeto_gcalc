from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardDataViewSet

router = DefaultRouter()
router.register(r'dashboard-data', DashboardDataViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
