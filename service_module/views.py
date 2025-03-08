from rest_framework import viewsets
from .models import ServiceDistribution

class ServiceDistributionViewSet(viewsets.ModelViewSet):
    queryset = ServiceDistribution.objects.all()
