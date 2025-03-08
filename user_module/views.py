from django.contrib.auth.models import User, Permission
from rest_framework import viewsets
from oauth2_provider.contrib.rest_framework import OAuth2Authentication

class UserViewSet(viewsets.ModelViewSet):
    authentication_classes = [OAuth2Authentication]
    queryset = User.objects.all()
    permission_classes = ...

class PermissionViewSet(viewsets.ModelViewSet):
    authentication_classes = [OAuth2Authentication]
    queryset = Permission.objects.all()
