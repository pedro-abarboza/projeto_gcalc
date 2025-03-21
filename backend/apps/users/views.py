from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User, Group, Permission
from .serializers import UserSerializer, UserListSerializer, GroupSerializer, PermissionSerializer
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .filters import UserFilter
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserFilter
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined', 'last_login']
    ordering = ['-date_joined']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return User.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({"detail": "Usuário desativado com sucesso."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='toggle_status')
    def toggle_status(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({"status": user.is_active, "detail": f"Usuário {'ativado' if user.is_active else 'desativado'} com sucesso."})
        
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar grupos de permissões (funções).
    """
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['name']
    search_fields = ['name']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por termo de busca no nome
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
            
        return queryset


class PermissionViewSet(viewsets.ModelViewSet):
    """
    API endpoint para listar permissões disponíveis no sistema.
    """
    queryset = Permission.objects.all().order_by('content_type__app_label', 'codename')
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['codename', 'name', 'content_type__app_label']
    search_fields = ['codename', 'name', 'content_type__app_label']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        app_label = self.request.query_params.get('app_label', None)
        if app_label:
            queryset = queryset.filter(content_type__app_label=app_label)
        return queryset
