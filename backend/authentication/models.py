from django.db import models

class Volunteer(models.Model):
    name = models.CharField(max_length=100)
    mobile_no = models.CharField(max_length=15, blank=True)
    role = models.CharField(max_length=50, default='Volunteer')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']