from django.contrib import admin
from .models import Service

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'client_name', 'calculation_type', 'status', 'assigned_to', 'reviewer', 'deadline')
    list_filter = ('status', 'calculation_type', 'assigned_to', 'reviewer')
    search_fields = ('title', 'client_name', 'client_document', 'description')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'description', 'calculation_type')
        }),
        ('Cliente', {
            'fields': ('client_name', 'client_document')
        }),
        ('Atribuições', {
            'fields': ('assigned_to', 'reviewer')
        }),
        ('Status e Prazos', {
            'fields': ('status', 'deadline')
        }),
        ('Valores e Anexos', {
            'fields': ('amount', 'attachments')
        }),
        ('Observações', {
            'fields': ('notes',)
        }),
        ('Informações do Sistema', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
