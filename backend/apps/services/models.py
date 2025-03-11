from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Service(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('in_progress', 'Em Andamento'),
        ('review', 'Em Revisão'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
    ]

    CALCULATION_TYPE_CHOICES = [
        ('rescisao', 'Rescisão'),
        ('ferias', 'Férias'),
        ('horas_extras', 'Horas Extras'),
        ('insalubridade', 'Insalubridade'),
        ('periculosidade', 'Periculosidade'),
        ('outros', 'Outros'),
    ]

    title = models.CharField(
        max_length=200,
        verbose_name='Título'
    )
    
    description = models.TextField(
        verbose_name='Descrição'
    )
    
    calculation_type = models.CharField(
        max_length=20,
        choices=CALCULATION_TYPE_CHOICES,
        verbose_name='Tipo de Cálculo'
    )
    
    client_name = models.CharField(
        max_length=200,
        verbose_name='Nome do Cliente'
    )
    
    client_document = models.CharField(
        max_length=20,
        verbose_name='Documento do Cliente'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Status'
    )
    
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_services',
        verbose_name='Atribuído para'
    )
    
    reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewing_services',
        verbose_name='Revisor'
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_services',
        verbose_name='Criado por'
    )
    
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Valor do Cálculo'
    )
    
    attachments = models.FileField(
        upload_to='services/attachments/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='Anexos'
    )
    
    notes = models.TextField(
        null=True,
        blank=True,
        verbose_name='Observações'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Atualizado em'
    )
    
    deadline = models.DateField(
        null=True,
        blank=True,
        verbose_name='Prazo'
    )

    class Meta:
        verbose_name = 'Serviço'
        verbose_name_plural = 'Serviços'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.client_name}"
