from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, PermissionViewSet

router = DefaultRouter()
router.register(r'user', UserViewSet)
router.register(r'permission', PermissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
