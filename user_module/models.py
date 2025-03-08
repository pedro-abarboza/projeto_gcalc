from django.contrib.auth.models import AbstractUser, Permission
from django.db import models

class User(AbstractUser):
    # Add any additional fields you need for the user model here
    pass

class Client(models.Model):
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=150)
    email = models.EmailField()
