from django.contrib import admin
<<<<<<< HEAD
from .models import Journey, JourneyPricing, Bus, Booking, Payment, SeatCancellation, PickupPoint

@admin.register(Journey)
class JourneyAdmin(admin.ModelAdmin):
    list_display = ['journey_type', 'journey_date', 'is_active', 'bus_count']
    list_filter = ['journey_type', 'is_active', 'journey_date']
    ordering = ['journey_date', 'journey_type']
    
    def bus_count(self, obj):
        return obj.buses.count()
    bus_count.short_description = 'Buses'

@admin.register(JourneyPricing)
class JourneyPricingAdmin(admin.ModelAdmin):
    list_display = ['journey_type', 'age_criteria', 'amount', 'is_active']
    list_filter = ['journey_type', 'is_active']
    ordering = ['journey_type', 'age_criteria']

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ['bus_number', 'journey', 'capacity', 'assigned_volunteer', 'booking_count']
    list_filter = ['journey__journey_type', 'journey__journey_date', 'capacity']
    search_fields = ['bus_number']
    ordering = ['journey__journey_date', 'journey__journey_type', 'bus_number']
    
    def booking_count(self, obj):
        return obj.onward_bookings.count() + obj.return_bookings.count()
    booking_count.short_description = 'Bookings'

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['passenger', 'journey_type', 'onward_journey', 'return_journey', 'total_price', 'payment_status', 'status']
    list_filter = ['journey_type', 'status', 'payment_status', 'onward_journey__journey_date', 'return_journey__journey_date']
    search_fields = ['passenger__name', 'passenger__mobile_no']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Passenger Information', {
            'fields': ('passenger', 'pickup_point', 'assigned_volunteer')
        }),
        ('Journey Selection', {
            'fields': ('journey_type', 'onward_journey', 'return_journey')
        }),
        ('Bus & Seat Assignment', {
            'fields': ('onward_bus', 'onward_seat_number', 'return_bus', 'return_seat_number')
        }),
        ('Pricing', {
            'fields': ('onward_price', 'return_price', 'total_price', 'custom_amount')
        }),
        ('Status', {
            'fields': ('status', 'payment_status', 'allow_unpaid_allocation')
        }),
        ('Additional Information', {
            'fields': ('remarks',),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['total_price']
=======
from .models import Booking, Payment, PickupPoint, Bus

@admin.register(PickupPoint)
class PickupPointAdmin(admin.ModelAdmin):
    list_display = ['name', 'location']
    search_fields = ['name', 'location']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['passenger', 'onwards_date', 'return_date', 'status', 'seat_number', 'data_captured_by']
    list_filter = ['status', 'onwards_date', 'return_date', 'data_captured_by']
    search_fields = ['passenger__name', 'seat_number']
    ordering = ['-created_at']
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['booking', 'amount', 'payment_method', 'collected_by', 'payment_date']
    list_filter = ['payment_method', 'payment_date']
    search_fields = ['booking__passenger__name', 'collected_by']
<<<<<<< HEAD
    ordering = ['-payment_date']

@admin.register(SeatCancellation)
class SeatCancellationAdmin(admin.ModelAdmin):
    list_display = ['booking', 'journey_type', 'reason', 'refund_amount', 'refund_processed', 'cancellation_date']
    list_filter = ['journey_type', 'reason', 'refund_processed', 'cancellation_date']
    search_fields = ['booking__passenger__name']
    ordering = ['-cancellation_date']

@admin.register(PickupPoint)
class PickupPointAdmin(admin.ModelAdmin):
    list_display = ['name', 'location']
    search_fields = ['name', 'location']
=======
    ordering = ['-created_at']

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ['bus_number', 'capacity', 'route_name']
    search_fields = ['bus_number', 'route_name']
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
