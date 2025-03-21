import django_filters
from .models import Client

class ClientFilter(django_filters.FilterSet):
    document_type = django_filters.CharFilter(field_name='document_type')
    status = django_filters.BooleanFilter(field_name='status')
    
    class Meta:
        model = Client
        fields = ['document_type', 'status'] 