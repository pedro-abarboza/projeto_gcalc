from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters import rest_framework as filters
from .models import Service
from .serializers import ServiceSerializer, ServiceListSerializer
from .filters import ServiceFilter

# Create your views here.

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    permission_classes = [IsAuthenticated]
    filterset_class = ServiceFilter
    filter_backends = (filters.DjangoFilterBackend,)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ServiceListSerializer
        return ServiceSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Service.objects.all()
        
        # Filtro por status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtro por tipo de cálculo
        calculation_type = self.request.query_params.get('calculation_type', None)
        if calculation_type:
            queryset = queryset.filter(calculation_type=calculation_type)
        
        # Filtro por cliente
        client = self.request.query_params.get('client', None)
        if client:
            queryset = queryset.filter(
                Q(client_name__icontains=client) | 
                Q(client_document__icontains=client)
            )
        
        # Filtro por responsável
        assigned = self.request.query_params.get('assigned', None)
        if assigned == 'me':
            queryset = queryset.filter(assigned_to=user)
        elif assigned == 'unassigned':
            queryset = queryset.filter(assigned_to__isnull=True)
        
        # Filtro por revisor
        reviewing = self.request.query_params.get('reviewing', None)
        if reviewing == 'me':
            queryset = queryset.filter(reviewer=user)
        
        return queryset
    
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
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        service = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'É necessário informar o novo status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in dict(Service.STATUS_CHOICES):
            return Response(
                {'error': 'Status inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service.status = new_status
        service.save()
        
        serializer = self.get_serializer(service)
        return Response(serializer.data)
