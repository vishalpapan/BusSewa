from django.db import models
from django.conf import settings
from passengers.models import Passenger

class PickupPoint(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    
    def __str__(self):
        return self.name

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
    capacity = models.IntegerField(default=40)
    route_name = models.CharField(max_length=100, blank=True)
    journey = models.ForeignKey(Journey, on_delete=models.CASCADE, related_name='buses', null=True, blank=True)
    assigned_volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_buses')
    
    class Meta:
        unique_together = ['bus_number', 'journey']
    
    def __str__(self):
        return f"Bus {self.bus_number or 'TBD'} - {self.journey}"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
    ]
    
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
    
    # Status & Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    payment_status = models.CharField(max_length=20, choices=[('Paid', 'Paid'), ('Pending', 'Pending'), ('Partial', 'Partial')], default='Pending')
    allow_unpaid_allocation = models.BooleanField(default=False)
    
    # Volunteer Assignment
    assigned_volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_bookings')
    is_volunteer = models.BooleanField(default=False, help_text="Is this passenger a volunteer?")

    # Attendance
    onward_attendance = models.BooleanField(null=True, blank=True, default=None, help_text="True=Present, False=Absent, None=Not Marked")
    return_attendance = models.BooleanField(null=True, blank=True, default=None, help_text="True=Present, False=Absent, None=Not Marked")
    attendance_notes = models.TextField(blank=True, help_text="Notes for attendance/shifting")

    # Remarks
    remarks = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
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
    payment_received_date = models.DateField(null=True, blank=True)
    
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
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    refund_processed = models.BooleanField(default=False)
    refund_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    # Journey-specific cancellation
    journey_type = models.CharField(max_length=10, choices=[('ONWARD', 'Onward'), ('RETURN', 'Return'), ('BOTH', 'Both')], null=True, blank=True)
    original_onward_seat = models.CharField(max_length=10, blank=True)
    original_return_seat = models.CharField(max_length=10, blank=True)
    original_amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def __str__(self):
        return f"Cancelled: {self.booking.passenger.name} - {self.journey_type}"


class OnSpotPassenger(models.Model):
    """Passengers who show up on-the-spot without prior reservation (standing passengers)"""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Pending', 'Pending'),
    ]
    
    JOURNEY_TYPE_CHOICES = [
        ('ONWARD', 'Onward'),
        ('RETURN', 'Return'),
    ]
    
    # Basic Info
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    mobile_no = models.CharField(max_length=15, blank=True)
    
    # Journey assignment
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='onspot_passengers')
    journey_type = models.CharField(max_length=10, choices=JOURNEY_TYPE_CHOICES)
    
    # Payment
    calculated_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Pending')
    
    # Tracking
    attendance = models.BooleanField(default=True, help_text="On-spot passengers are present by default")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def calculate_age_criteria(self):
        """Determine age criteria based on age and gender"""
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
    
    def calculate_price(self):
        """Calculate price based on age criteria using JourneyPricing"""
        age_criteria = self.calculate_age_criteria()
        try:
            pricing = JourneyPricing.objects.get(
                journey_type=self.journey_type,
                age_criteria=age_criteria,
                is_active=True
            )
            return pricing.amount
        except JourneyPricing.DoesNotExist:
            # Fallback pricing
            if '12 & Below' in age_criteria:
                return 290.00
            elif '65 & Above' in age_criteria or 'Below 75' in age_criteria:
                return 290.00
            elif '75 & Above' in age_criteria:
                return 0.00
            else:
                return 550.00
    
    def save(self, *args, **kwargs):
        # Auto-calculate price if not set
        if not self.calculated_price or self.calculated_price == 0:
            self.calculated_price = self.calculate_price()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"On-Spot: {self.name} - Bus {self.bus.bus_number} ({self.journey_type})"
    
    class Meta:
        ordering = ['-created_at']

