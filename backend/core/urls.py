"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from apps.users.views import PermissionViewSet, GroupViewSet
from rest_framework.routers import DefaultRouter

# Criar routers específicos para auth
auth_router = DefaultRouter()
auth_router.register('permissions', PermissionViewSet)
auth_router.register('groups', GroupViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API de autenticação
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include(auth_router.urls)),
    
    # API do módulo de usuários
    path('api/users/', include('apps.users.urls')),
    
    # API do módulo de clientes
    path('api/clients/', include('apps.clients.urls')),
    
    # API do módulo de serviços e tipos de serviço
    path('api/services/', include('apps.services.urls')),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
