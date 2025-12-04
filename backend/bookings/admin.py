from django.contrib import admin
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

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['booking', 'amount', 'payment_method', 'collected_by', 'payment_date']
    list_filter = ['payment_method', 'payment_date']
    search_fields = ['booking__passenger__name', 'collected_by']
    ordering = ['-created_at']

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ['bus_number', 'capacity', 'route_name']
    search_fields = ['bus_number', 'route_name']