from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, ClientViewSet, ServiceTypeClientViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'service-types', ServiceTypeClientViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 