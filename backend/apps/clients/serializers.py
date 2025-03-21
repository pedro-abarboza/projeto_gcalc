from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Client


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')

class ClientSerializer(serializers.ModelSerializer):
    created_by = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)