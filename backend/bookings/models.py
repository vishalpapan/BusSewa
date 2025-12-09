from django.db import models
from django.conf import settings
from passengers.models import Passenger

class PickupPoint(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    
    def __str__(self):
        return self.name

class Bus(models.Model):
    bus_number = models.CharField(max_length=20, blank=True)
    capacity = models.IntegerField(default=40)
    route_name = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"Bus {self.bus_number or 'TBD'} - {self.capacity} seats"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
    ]
    
    # Passenger Info
    passenger = models.ForeignKey(Passenger, on_delete=models.CASCADE)
    
    # Journey Details
    onwards_date = models.DateField(null=True, blank=True)
    return_date = models.DateField(null=True, blank=True)
    pickup_point = models.ForeignKey(PickupPoint, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Bus Assignment (flexible)
    assigned_bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True)
    seat_number = models.CharField(max_length=10, blank=True, default='', help_text='Seat number (1-40)')
    bus_number = models.CharField(max_length=20, blank=True, default='', help_text='Actual bus registration number')
    departure_time = models.TimeField(null=True, blank=True, default=None)
    
    # Pricing
    calculated_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status & Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    
    # SMS/WhatsApp Notifications
    sms_sent = models.BooleanField(default=False, blank=True)
    sms_sent_at = models.DateTimeField(null=True, blank=True, default=None)
    whatsapp_sent = models.BooleanField(default=False, blank=True)
    whatsapp_sent_at = models.DateTimeField(null=True, blank=True, default=None)
    
    # Data Capture Info
    data_captured_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    data_captured_date = models.DateField(auto_now_add=True)
    
    # Remarks
    remarks = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Auto-calculate price based on age criteria
        if not self.calculated_price:
            self.calculated_price = self.calculate_price()
        super().save(*args, **kwargs)
    
    def calculate_price(self):
        """Calculate price based on passenger age criteria"""
        age_criteria = self.passenger.age_criteria
        
        # Base prices
        if 'M-12 & Below' in age_criteria or 'F-12 & Below' in age_criteria:
            return 290.00  # Child price
        elif 'M-65 & Above' in age_criteria or 'F-Above 12 & Below 75' in age_criteria:
            return 290.00  # Senior/Female price
        elif 'M&F-75 & Above' in age_criteria:
            return 0.00    # Free for 75+
        else:
            return 550.00  # Adult male price
    
    def __str__(self):
        return f"{self.passenger.name} - {self.onwards_date}"
    
    class Meta:
        ordering = ['-created_at']

class Payment(models.Model):
    PAYMENT_METHODS = [
        ('Cash', 'Cash'),
        ('GPay', 'GPay'),
        ('Online', 'Online'),
    ]
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='Cash')
    collected_by = models.CharField(max_length=50, blank=True)
    payment_date = models.DateField(auto_now_add=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.booking.passenger.name} - ₹{self.amount}"