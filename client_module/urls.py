from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, ServiceTypeViewSet

router = DefaultRouter()
router.register(r'client', ClientViewSet)
router.register(r'service-type', ServiceTypeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
