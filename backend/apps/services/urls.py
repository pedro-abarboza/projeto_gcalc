from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, ServiceTypeClientViewSet

router = DefaultRouter()
router.register(r'', ServiceViewSet)
router.register(r'service-types', ServiceTypeClientViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 