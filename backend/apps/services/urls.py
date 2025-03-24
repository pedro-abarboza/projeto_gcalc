from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, ServiceTypeClientViewSet

router = DefaultRouter()
router.register("service-types", ServiceTypeClientViewSet)
router.register("", ServiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 