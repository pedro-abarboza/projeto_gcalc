import django_filters
from .models import Service

class ServiceFilter(django_filters.FilterSet):
    client = django_filters.NumberFilter(field_name='client__id')
    service_type = django_filters.NumberFilter(field_name='service_type__id')
    status = django_filters.CharFilter(field_name='status')
    assigned_to = django_filters.NumberFilter(field_name='assigned_to__id')
    reviewer = django_filters.NumberFilter(field_name='reviewer__id')
    created_by = django_filters.NumberFilter(field_name='created_by__id')
    
    class Meta:
        model = Service
        fields = ['client', 'service_type', 'status', 'assigned_to', 'reviewer', 'created_by'] 