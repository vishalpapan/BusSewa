from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ('full_name', 'department')

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ['username', 'get_full_name', 'role', 'is_active', 'can_modify_seats', 'can_cancel_seats']
    list_filter = ['role', 'is_active', 'can_modify_seat_allocation', 'can_cancel_seats']
    search_fields = ['username', 'profile__full_name', 'profile__department']
    list_editable = ['is_active']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('BusSewa Role & Permissions', {
            'fields': ('role', 'can_modify_seat_allocation', 'can_cancel_seats'),
            'description': 'Role Templates: Admin (all permissions), Volunteer (seat modification only), Viewer (read-only)'
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('BusSewa Role & Permissions', {
            'fields': ('role', 'can_modify_seat_allocation', 'can_cancel_seats'),
            'description': 'Choose role to auto-set permissions'
        }),
    )
    
    def get_full_name(self, obj):
        return obj.profile.full_name if hasattr(obj, 'profile') else obj.username
    get_full_name.short_description = 'Full Name'
    
    def can_modify_seats(self, obj):
        return obj.can_modify_seat_allocation
    can_modify_seats.boolean = True
    can_modify_seats.short_description = 'Modify Seats'
    
    def can_cancel_seats(self, obj):
        return obj.can_cancel_seats
    can_cancel_seats.boolean = True
    can_cancel_seats.short_description = 'Cancel Seats'
    
    actions = ['activate_users', 'deactivate_users', 'grant_seat_permissions']
    
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} users activated.')
    activate_users.short_description = 'Activate selected users'
    
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} users deactivated.')
    deactivate_users.short_description = 'Deactivate selected users'
    
    def grant_seat_permissions(self, request, queryset):
        updated = queryset.update(can_modify_seat_allocation=True, can_cancel_seats=True)
        self.message_user(request, f'Seat permissions granted to {updated} users.')
    grant_seat_permissions.short_description = 'Grant seat permissions'

# Customize admin site
admin.site.site_header = 'BusSewa Administration'
admin.site.site_title = 'BusSewa Admin'
admin.site.index_title = 'Volunteer & Booking Management'