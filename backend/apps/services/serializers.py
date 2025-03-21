from rest_framework import serializers
from django.contrib.auth.models import User
from apps.clients.models import Client
from apps.clients.serializers import ClientSerializer
from .models import Service, ServiceTypeClient


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')

class ServiceTypeClientSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    created_by = UserMinimalSerializer(read_only=True)
    client = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = ServiceTypeClient
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_client_name(self, obj):
        return obj.client.name if obj.client else None
    
    def create(self, validated_data):
        # Adicionar o usuário atual como criador
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)

class ServiceTypeClientListSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceTypeClient
        fields = ('id', 'name', 'price', 'client', 'client_name', 'description', 'status', 'created_at')
        read_only_fields = ('created_at',)
    
    def get_client_name(self, obj):
        return obj.client.name if obj.client else None

class ServiceSerializer(serializers.ModelSerializer):
    assigned_to = UserMinimalSerializer(read_only=True)
    reviewer = UserMinimalSerializer(read_only=True)
    created_by = UserMinimalSerializer(read_only=True)
    client_details = ClientSerializer(source='client', read_only=True)
    service_type_details = ServiceTypeClientSerializer(source='service_type', read_only=True)
    
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigned_to',
        write_only=True,
        required=False,
        allow_null=True
    )
    reviewer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='reviewer',
        write_only=True,
        required=False,
        allow_null=True
    )
    client = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        write_only=True
    )
    service_type = serializers.PrimaryKeyRelatedField(
        queryset=ServiceTypeClient.objects.all(),
        write_only=True
    )

    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ServiceListSerializer(serializers.ModelSerializer):
    assigned_to = UserMinimalSerializer(read_only=True)
    reviewer = UserMinimalSerializer(read_only=True)
    created_by = UserMinimalSerializer(read_only=True)
    client_name = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    service_type_name = serializers.CharField(source='service_type.name', read_only=True)

    class Meta:
        model = Service
        fields = ('id', 'title', 'client', 'client_name', 'service_type', 'service_type_name', 'status', 
                 'description', 'assigned_to', 'reviewer', 'created_by', 'deadline', 'created_at')
        read_only_fields = ('created_at',) 