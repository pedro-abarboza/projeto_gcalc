from django.db import models

class ServiceDistribution(models.Model):
    user = models.ForeignKey('user_module.User', on_delete=models.CASCADE)
    client = models.ForeignKey('client_module.Client', on_delete=models.CASCADE)
    service_type = models.ForeignKey('client_module.ServiceType', on_delete=models.CASCADE)
