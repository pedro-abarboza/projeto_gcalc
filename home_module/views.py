from rest_framework import viewsets
from oauth2_provider.contrib.rest_framework import OAuth2Authentication
from .models import DashboardData
from .serializers import DashboardDataSerializer

class DashboardDataViewSet(viewsets.ModelViewSet):
    authentication_classes = [OAuth2Authentication]
    queryset = DashboardData.objects.all()
    serializer_class = DashboardDataSerializer
