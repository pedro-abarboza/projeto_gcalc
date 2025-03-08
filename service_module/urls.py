from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ServiceDistributionViewSet

router = DefaultRouter()
router.register(r'service-distribution', ServiceDistributionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
