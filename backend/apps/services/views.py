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
    serializer_class = ServiceSerializer
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ServiceListSerializer
        return ServiceSerializer
    
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
