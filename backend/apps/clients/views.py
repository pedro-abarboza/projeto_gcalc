from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from .models import Client
from .serializers import ClientSerializer
from .filters import ClientFilter

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    permission_classes = [IsAuthenticated]
    filterset_class = ClientFilter
    filter_backends = (filters.DjangoFilterBackend, SearchFilter, OrderingFilter)
    search_fields = ['name', 'document_number', 'email', 'phone']
    ordering_fields = ['name', 'document_type', 'document_number', 'created_at', 'status']
    ordering = ['name']
    pagination_class = StandardResultsSetPagination
    serializer_class = ClientSerializer
    
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        client = self.get_object()
        client.status = not client.status
        client.save()
        serializer = ClientListSerializer(client)
        return Response(serializer.data) 