from django.contrib import admin
from .models import Service, ServiceTypeClient

@admin.register(ServiceTypeClient)
class ServiceTypeClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'client', 'price', 'status')
    list_filter = ('status', 'client')
    search_fields = ('name', 'description', 'client__name')
    readonly_fields = ('created_at',)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'service_type', 'status', 'assigned_to', 'reviewer', 'deadline')
    list_filter = ('status', 'client', 'service_type', 'assigned_to', 'reviewer')
    search_fields = ('title', 'description', 'client__name', 'service_type__name')
    readonly_fields = ('created_at', 'updated_at', 'created_by')
