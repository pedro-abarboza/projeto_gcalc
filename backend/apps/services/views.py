from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from .models import Service, ServiceTypeClient
from .serializers import (
    ServiceSerializer, ServiceListSerializer,
    ServiceTypeClientSerializer, ServiceTypeClientListSerializer
)
from .filters import ServiceFilter

# Create your views here.

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ServiceTypeClientViewSet(viewsets.ModelViewSet):
    """
    API endpoint para tipos de serviço.
    """
    queryset = ServiceTypeClient.objects.all()
    serializer_class = ServiceTypeClientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter, filters.DjangoFilterBackend]
    search_fields = ['name', 'description', 'client__name']
    ordering_fields = ['name', 'created_at', 'price']
    filterset_fields = ['client', 'status']
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ServiceTypeClientListSerializer
        return ServiceTypeClientSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por cliente
        client_id = self.request.query_params.get('client_id')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        # Filtrar por status
        status = self.request.query_params.get('status')
        if status is not None:
            if status.lower() == 'true':
                queryset = queryset.filter(status=True)
            elif status.lower() == 'false':
                queryset = queryset.filter(status=False)
        
        return queryset
    
    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        service_type = self.get_object()
        service_type.status = not service_type.status
        service_type.save()
        serializer = ServiceTypeClientListSerializer(service_type)
        return Response(serializer.data)

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    permission_classes = [IsAuthenticated]
    filterset_class = ServiceFilter
    filter_backends = (filters.DjangoFilterBackend, SearchFilter, OrderingFilter)
    search_fields = ['title', 'description', 'client__name', 'service_type__name']
    ordering_fields = ['title', 'client__name', 'service_type__name', 'status', 'deadline', 'created_at']
    ordering = ['-created_at']
    pagination_class = StandardResultsSetPagination
    serializer_class = ServiceSerializer
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ServiceListSerializer
        return ServiceSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        service = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'É necessário informar o ID do usuário'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service.assigned_to_id = user_id
        service.save()
        
        serializer = self.get_serializer(service)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        service = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'É necessário informar o ID do usuário'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service.reviewer_id = user_id
        service.status = 'review'
        service.save()
        
        serializer = self.get_serializer(service)
        return Response(serializer.data)
