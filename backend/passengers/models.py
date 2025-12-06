from django.db import models
from .validators import validate_document_file

def passenger_document_path(instance, filename):
    # Generate secure filename: passenger_ID_timestamp.extension
    import time
    import os
    ext = os.path.splitext(filename)[1]
    return f'aadhar_documents/passenger_{instance.id}_{int(time.time())}{ext}'

class Passenger(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]
    
    AGE_CATEGORIES = [
        ('M-12 & Below', 'Male - 12 & Below'),
        ('M-Above 12 & Below 65', 'Male - Above 12 & Below 65'),
        ('M-65 & Above', 'Male - 65 & Above'),
        ('F-12 & Below', 'Female - 12 & Below'),
        ('F-Above 12 & Below 75', 'Female - Above 12 & Below 75'),
        ('M&F-75 & Above', 'Male & Female - 75 & Above'),
    ]
    
    CATEGORY_CHOICES = [
        ('Satsang', 'Satsang'),
        ('Sewadal', 'Sewadal'),
        ('Bal Sewadal', 'Bal Sewadal'),
    ]
    
    VERIFICATION_STATUS = [
        ('Not Required', 'Not Required'),
        ('Pending', 'Pending Verification'),
        ('Verified', 'Verified'),
        ('Rejected', 'Rejected'),
    ]
    
    # Basic Info
    name = models.CharField(max_length=100)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    age_criteria = models.CharField(max_length=50, choices=AGE_CATEGORIES)
    mobile_no = models.CharField(max_length=15, blank=True)
    
    # Family/Group Travel
    related_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, default=None, related_name='family_members')
    relationship = models.CharField(max_length=50, blank=True, default='', help_text='e.g., Spouse, Child, Parent, Sibling')
    
    # Category
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    # Document Verification
    aadhar_received = models.BooleanField(default=False)
    aadhar_document = models.FileField(
        upload_to=passenger_document_path, 
        blank=True, 
        null=True,
        validators=[validate_document_file],
        help_text='Upload Aadhar card (PDF, JPG, PNG, WEBP - Max 5MB)'
    )
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='Not Required')
    verification_notes = models.TextField(blank=True, help_text='Volunteer verification notes')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def requires_verification(self):
        """Check if passenger needs document verification for concession"""
        return ('65 & Above' in self.age_criteria or 
                '75 & Above' in self.age_criteria or 
                '12 & Below' in self.age_criteria)
    
    def save(self, *args, **kwargs):
        # Auto-set verification status based on age criteria
        if self.requires_verification():
            if self.verification_status == 'Not Required':
                self.verification_status = 'Pending'
        else:
            self.verification_status = 'Not Required'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} - {self.category}"
    
    class Meta:
        ordering = ['name']