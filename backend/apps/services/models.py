from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

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

class ServiceTypeClient(models.Model):
    """
    Modelo para tipos de serviço vinculados a clientes específicos.
    """
    name = models.CharField(max_length=100, verbose_name="Nome")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Preço Base")
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="service_types", verbose_name="Cliente")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_service_types_client", verbose_name="Criado por")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Data de Atualização")
    status = models.BooleanField(default=True, verbose_name="Ativo")

    class Meta:
        verbose_name = "Tipo de Serviço"
        verbose_name_plural = "Tipos de Serviço"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.client.name}"

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
    
    service_type = models.ForeignKey(
        ServiceTypeClient,
        on_delete=models.PROTECT,
        related_name='services',
        verbose_name='Tipo de Serviço'
    )
    
    client = models.ForeignKey(
        Client,
        on_delete=models.PROTECT,
        related_name='services',
        verbose_name='Cliente'
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
        return f"{self.title} - {self.client.name}"
