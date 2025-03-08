from django.db import models

class ServiceType(models.Model):
    name = models.CharField(max_length=100)
    cost = models.DecimalField(max_digits=6, decimal_places=2)
    observation = models.TextField()

class Client(models.Model):
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=150)
    email = models.EmailField()
