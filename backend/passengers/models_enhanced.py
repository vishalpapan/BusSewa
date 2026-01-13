from django.db import models
from .validators import validate_document_file, validate_aadhar_number

def passenger_document_path(instance, filename):
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
    age = models.IntegerField(help_text='Age in years')  # NEW: Separate age field
    age_criteria = models.CharField(max_length=50, choices=AGE_CATEGORIES)
    mobile_no = models.CharField(max_length=15, blank=True)
    aadhar_number = models.CharField(max_length=12, blank=True, validators=[validate_aadhar_number], help_text='12-digit Aadhar number')
    aadhar_required = models.BooleanField(default=False, help_text='Auto-calculated based on age criteria')  # NEW: Auto-calculated field
    
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
    
    def calculate_age_criteria(self):
        """Auto-calculate age criteria based on age and gender"""
        if self.gender == 'M':
            if self.age <= 12:
                return 'M-12 & Below'
            elif self.age >= 75:
                return 'M&F-75 & Above'
            elif self.age >= 65:
                return 'M-65 & Above'
            else:
                return 'M-Above 12 & Below 65'
        else:  # Female
            if self.age <= 12:
                return 'F-12 & Below'
            elif self.age >= 75:
                return 'M&F-75 & Above'
            else:
                return 'F-Above 12 & Below 75'
    
    def calculate_aadhar_required(self):
        """Check if Aadhar is required based on age criteria"""
        required_categories = [
            'M-65 & Above',                   # Male 65+
            'M&F-75 & Above'                  # 75+
        ]
        return self.age_criteria in required_categories
    
    def requires_verification(self):
        """Check if passenger needs document verification for concession"""
        return self.aadhar_required
    
    def save(self, *args, **kwargs):
        # Auto-calculate age criteria if not set
        if not self.age_criteria and self.age and self.gender:
            self.age_criteria = self.calculate_age_criteria()
        
        # Auto-calculate aadhar requirement
        self.aadhar_required = self.calculate_aadhar_required()
        
        # Auto-set verification status
        if self.aadhar_required:
            if self.verification_status == 'Not Required':
                self.verification_status = 'Pending'
        else:
            self.verification_status = 'Not Required'
        
        super().save(*args, **kwargs)
    
    def clean(self):
        """Validate aadhar number is provided when required"""
        from django.core.exceptions import ValidationError
        
        if self.aadhar_required and not self.aadhar_number:
            raise ValidationError({
                'aadhar_number': 'Aadhar number is required for this age category.'
            })
    
    def __str__(self):
        return f"{self.name} - {self.category} (Age: {self.age})"
    
    class Meta:
        ordering = ['name']