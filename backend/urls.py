from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    path('user/', include('user_module.urls')),
    path('client/', include('client_module.urls')),
    path('service/', include('service_module.urls')),
    path('home/', include('home_module.urls')),
]
