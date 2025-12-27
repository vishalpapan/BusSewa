from django.db import models
from django.conf import settings
from passengers.models import Passenger

class PickupPoint(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    
    def __str__(self):
        return self.name

<<<<<<< HEAD
class Journey(models.Model):
    JOURNEY_TYPES = [
        ('ONWARD', 'Onward Journey'),
        ('RETURN', 'Return Journey'),
    ]
    
    journey_type = models.CharField(max_length=10, choices=JOURNEY_TYPES)
    journey_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['journey_type', 'journey_date']
        ordering = ['journey_date', 'journey_type']
    
    def __str__(self):
        return f"{self.get_journey_type_display()} - {self.journey_date}"

class JourneyPricing(models.Model):
    AGE_CRITERIA_CHOICES = [
        ('M-12 & Below', 'M-12 & Below'),
        ('F-12 & Below', 'F-12 & Below'),
        ('M-65 & Above', 'M-65 & Above'),
        ('F-Above 12 & Below 75', 'F-Above 12 & Below 75'),
        ('M&F-75 & Above', 'M&F-75 & Above'),
        ('M-Above 12 & Below 65', 'M-Above 12 & Below 65'),
    ]
    
    JOURNEY_TYPES = [
        ('ONWARD', 'Onward Journey'),
        ('RETURN', 'Return Journey'),
    ]
    
    journey_type = models.CharField(max_length=10, choices=JOURNEY_TYPES)
    age_criteria = models.CharField(max_length=30, choices=AGE_CRITERIA_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['journey_type', 'age_criteria']
    
    def __str__(self):
        return f"{self.get_journey_type_display()} - {self.age_criteria}: ₹{self.amount}"

class Bus(models.Model):
    bus_number = models.CharField(max_length=20, blank=True)
    capacity = models.IntegerField(default=42)
    route_name = models.CharField(max_length=100, blank=True)
    journey = models.ForeignKey(Journey, on_delete=models.CASCADE, related_name='buses', null=True, blank=True)
    assigned_volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_buses')
    
    class Meta:
        unique_together = ['bus_number', 'journey']
    
    def __str__(self):
        return f"Bus {self.bus_number or 'TBD'} - {self.journey}"
=======
class Bus(models.Model):
    bus_number = models.CharField(max_length=20, blank=True)
    capacity = models.IntegerField(default=40)
    route_name = models.CharField(max_length=100, blank=True)
    assigned_volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_buses', help_text='Volunteer responsible for this bus')
    
    def __str__(self):
        return f"Bus {self.bus_number or 'TBD'} - {self.capacity} seats"
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498

class Booking(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
    ]
    
<<<<<<< HEAD
    JOURNEY_SELECTION = [
        ('ONWARD', 'Onward Only'),
        ('RETURN', 'Return Only'),
        ('BOTH', 'Both Journeys'),
    ]
    
    # Passenger Info
    passenger = models.ForeignKey(Passenger, on_delete=models.CASCADE)
    
    # Journey Selection
    journey_type = models.CharField(max_length=10, choices=JOURNEY_SELECTION, default='BOTH')
    
    # Journey Details
    onward_journey = models.ForeignKey(Journey, on_delete=models.SET_NULL, null=True, blank=True, related_name='onward_bookings')
    return_journey = models.ForeignKey(Journey, on_delete=models.SET_NULL, null=True, blank=True, related_name='return_bookings')
    pickup_point = models.ForeignKey(PickupPoint, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Bus Assignment
    onward_bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True, related_name='onward_bookings')
    return_bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True, related_name='return_bookings')
    onward_seat_number = models.CharField(max_length=10, blank=True, default='')
    return_seat_number = models.CharField(max_length=10, blank=True, default='')
    
    # Pricing
    onward_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    return_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    custom_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
=======
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
    custom_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Custom booking amount (overrides calculated price)')
    amount_updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='amount_updates')
    amount_updated_at = models.DateTimeField(null=True, blank=True)
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    
    # Status & Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    payment_status = models.CharField(max_length=20, choices=[('Paid', 'Paid'), ('Pending', 'Pending'), ('Partial', 'Partial')], default='Pending')
<<<<<<< HEAD
    allow_unpaid_allocation = models.BooleanField(default=False)
    
    # Volunteer Assignment
    assigned_volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_bookings')
=======
    allow_unpaid_allocation = models.BooleanField(default=False, help_text='Allow seat allocation even if payment is pending')
    
    # SMS/WhatsApp Notifications
    sms_sent = models.BooleanField(default=False, blank=True)
    sms_sent_at = models.DateTimeField(null=True, blank=True, default=None)
    whatsapp_sent = models.BooleanField(default=False, blank=True)
    whatsapp_sent_at = models.DateTimeField(null=True, blank=True, default=None)
    
    # Data Capture Info
    data_captured_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    data_captured_date = models.DateField(auto_now_add=True)
    
    # Volunteer Assignment
    assigned_volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_bookings', help_text='Volunteer responsible for this passenger')
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    
    # Remarks
    remarks = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
<<<<<<< HEAD
        # Auto-calculate prices
        if not self.onward_price and self.onward_journey:
            self.onward_price = self.calculate_journey_price('ONWARD')
        if not self.return_price and self.return_journey:
            self.return_price = self.calculate_journey_price('RETURN')
        
        self.total_price = self.onward_price + self.return_price
        super().save(*args, **kwargs)
    
    def calculate_journey_price(self, journey_type):
        """Calculate price for specific journey type"""
        try:
            pricing = JourneyPricing.objects.get(
                journey_type=journey_type,
                age_criteria=self.passenger.age_criteria,
                is_active=True
            )
            return pricing.amount
        except JourneyPricing.DoesNotExist:
            # Fallback to default pricing
            age_criteria = self.passenger.age_criteria
            if 'M-12 & Below' in age_criteria or 'F-12 & Below' in age_criteria:
                return 290.00
            elif 'M-65 & Above' in age_criteria or 'F-Above 12 & Below 75' in age_criteria:
                return 290.00
            elif 'M&F-75 & Above' in age_criteria:
                return 0.00
            else:
                return 550.00
    
    def get_final_amount(self):
        """Get the final booking amount"""
        return self.custom_amount if self.custom_amount is not None else self.total_price
    
    def __str__(self):
        return f"{self.passenger.name} - {self.get_journey_type_display()}"
    
    class Meta:
        ordering = ['-created_at']
=======
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
    
    def get_final_amount(self):
        """Get the final booking amount (custom or calculated)"""
        return self.custom_amount if self.custom_amount is not None else self.calculated_price
    
    def update_custom_amount(self, amount, updated_by):
        """Update custom amount with tracking"""
        from django.utils import timezone
        self.custom_amount = amount
        self.amount_updated_by = updated_by
        self.amount_updated_at = timezone.now()
        self.save()
    
    def __str__(self):
        return f"{self.passenger.name} - {self.onwards_date}"
    
    class Meta:
        ordering = ['-created_at']
        
    def cancel_seat(self, cancelled_by, reason='Passenger Request', refund_amount=0, notes=''):
        """Cancel seat allocation and preserve data"""
        from .models import SeatCancellation
        
        # Create cancellation record
        cancellation = SeatCancellation.objects.create(
            booking=self,
            cancelled_by=cancelled_by,
            reason=reason,
            refund_amount=refund_amount,
            notes=notes,
            original_seat_number=self.seat_number,
            original_bus_number=self.bus_number,
            original_amount_paid=sum(p.amount for p in self.payment_set.all())
        )
        
        # Clear seat allocation but keep booking
        self.seat_number = ''
        self.assigned_bus = None
        self.status = 'Cancelled'
        self.save()
        
        return cancellation
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498

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
    payment_date = models.DateTimeField(auto_now_add=True)
<<<<<<< HEAD
    payment_received_date = models.DateField(null=True, blank=True)
    
=======
    payment_received_date = models.DateField(null=True, blank=True, help_text='Actual date when payment was received')
    
    # Timestamps
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.booking.passenger.name} - ₹{self.amount}"

class SeatCancellation(models.Model):
    CANCELLATION_REASONS = [
        ('Passenger Request', 'Passenger Request'),
        ('Medical Emergency', 'Medical Emergency'),
        ('Travel Plan Changed', 'Travel Plan Changed'),
        ('Other', 'Other'),
    ]
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='cancellations')
    cancelled_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    cancellation_date = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=50, choices=CANCELLATION_REASONS, default='Passenger Request')
<<<<<<< HEAD
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
=======
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='Amount to be refunded')
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    refund_processed = models.BooleanField(default=False)
    refund_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
<<<<<<< HEAD
    # Journey-specific cancellation
    journey_type = models.CharField(max_length=10, choices=[('ONWARD', 'Onward'), ('RETURN', 'Return'), ('BOTH', 'Both')], null=True, blank=True)
    original_onward_seat = models.CharField(max_length=10, blank=True)
    original_return_seat = models.CharField(max_length=10, blank=True)
    original_amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def __str__(self):
        return f"Cancelled: {self.booking.passenger.name} - {self.journey_type}"
=======
    # Preserve original booking data
    original_seat_number = models.CharField(max_length=10, blank=True)
    original_bus_number = models.CharField(max_length=20, blank=True)
    original_amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def __str__(self):
        return f"Cancelled: {self.booking.passenger.name} - Seat {self.original_seat_number}"
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
