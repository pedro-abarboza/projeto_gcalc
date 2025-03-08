from rest_framework import viewsets
from .models import Client, ServiceType

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()

class ServiceTypeViewSet(viewsets.ModelViewSet):
    queryset = ServiceType.objects.all()
