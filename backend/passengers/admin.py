from django.contrib import admin
from .models import Passenger

@admin.register(Passenger)
class PassengerAdmin(admin.ModelAdmin):
    list_display = ['name', 'gender', 'age_criteria', 'category', 'verification_status', 'aadhar_received', 'created_at']
    list_filter = ['gender', 'category', 'age_criteria', 'verification_status', 'aadhar_received']
    search_fields = ['name', 'mobile_no']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'gender', 'age_criteria', 'category', 'mobile_no')
        }),
        ('Document Verification', {
            'fields': ('aadhar_received', 'aadhar_document', 'verification_status', 'verification_notes'),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        # Make verification_status readonly for non-superusers
        if not request.user.is_superuser:
            return ['verification_status']
        return []