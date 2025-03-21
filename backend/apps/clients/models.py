from django.db import models
from django.contrib.auth.models import User


class Client(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('cpf', 'CPF'),
        ('cnpj', 'CNPJ'),
    ]
    
    name = models.CharField(
        max_length=200,
        verbose_name='Nome'
    )
    
    document_type = models.CharField(
        max_length=4,
        choices=DOCUMENT_TYPE_CHOICES,
        default='cpf',
        verbose_name='Tipo de Documento'
    )
    
    document_number = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Número do Documento'
    )
    
    email = models.EmailField(
        null=True,
        blank=True,
        verbose_name='E-mail'
    )
    
    phone = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        verbose_name='Telefone'
    )
    
    address = models.TextField(
        null=True,
        blank=True,
        verbose_name='Endereço'
    )
    
    notes = models.TextField(
        null=True,
        blank=True,
        verbose_name='Observações'
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_clients',
        verbose_name='Criado por'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Atualizado em'
    )
    
    status = models.BooleanField(
        default=True,
        verbose_name='Ativo'
    )
    
    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.document_number})" 