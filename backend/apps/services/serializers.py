from rest_framework import serializers
from .models import Service
from django.contrib.auth import get_user_model

User = get_user_model()

class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')

class ServiceSerializer(serializers.ModelSerializer):
    assigned_to = UserMinimalSerializer(read_only=True)
    reviewer = UserMinimalSerializer(read_only=True)
    created_by = UserMinimalSerializer(read_only=True)
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

    class Meta:
        model = Service
        fields = ('id', 'title', 'client_name', 'calculation_type', 'status', 
                 'assigned_to', 'reviewer', 'created_by', 'deadline', 'created_at')
        read_only_fields = ('created_at',) 