from django_filters import rest_framework as filters
from django.contrib.auth.models import User, Group


class UserFilter(filters.FilterSet):
    username = filters.CharFilter(lookup_expr='icontains')
    email = filters.CharFilter(lookup_expr='icontains')
    first_name = filters.CharFilter(lookup_expr='icontains')
    last_name = filters.CharFilter(lookup_expr='icontains')
    is_active = filters.BooleanFilter()
    groups = filters.ModelMultipleChoiceFilter(
        field_name='groups',
        to_field_name='id',
        conjoined=False,
        queryset=Group.objects.all()
    )
    date_joined_after = filters.DateTimeFilter(field_name='date_joined', lookup_expr='gte')
    date_joined_before = filters.DateTimeFilter(field_name='date_joined', lookup_expr='lte')
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'groups', 'is_active', 
                 'date_joined_after', 'date_joined_before'] 