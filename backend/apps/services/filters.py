from django_filters import rest_framework as filters
from .models import Service
from django.db import models

class ServiceFilter(filters.FilterSet):
    client = filters.CharFilter(method='filter_client')
    assigned = filters.CharFilter(method='filter_assigned')
    reviewing = filters.CharFilter(method='filter_reviewing')
    start_date = filters.DateFilter(field_name='created_at', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='created_at', lookup_expr='lte')
    deadline_start = filters.DateFilter(field_name='deadline', lookup_expr='gte')
    deadline_end = filters.DateFilter(field_name='deadline', lookup_expr='lte')

    class Meta:
        model = Service
        fields = {
            'status': ['exact'],
            'calculation_type': ['exact'],
            'assigned_to': ['exact', 'isnull'],
            'reviewer': ['exact', 'isnull'],
        }

    def filter_client(self, queryset, name, value):
        return queryset.filter(
            models.Q(client_name__icontains=value) |
            models.Q(client_document__icontains=value)
        )

    def filter_assigned(self, queryset, name, value):
        if value == 'me':
            return queryset.filter(assigned_to=self.request.user)
        elif value == 'unassigned':
            return queryset.filter(assigned_to__isnull=True)
        return queryset

    def filter_reviewing(self, queryset, name, value):
        if value == 'me':
            return queryset.filter(reviewer=self.request.user)
        return queryset 