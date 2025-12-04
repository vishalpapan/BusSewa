from django.contrib import admin
from .models import Volunteer

@admin.register(Volunteer)
class VolunteerAdmin(admin.ModelAdmin):
    list_display = ['name', 'mobile_no', 'role', 'is_active']
    list_filter = ['role', 'is_active']
    search_fields = ['name', 'mobile_no']