from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('volunteer', 'Volunteer'),
        ('viewer', 'Viewer'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='volunteer')
    phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Seat allocation permissions
    can_modify_seat_allocation = models.BooleanField(default=False, help_text='Can modify seat allocations')
    can_cancel_seats = models.BooleanField(default=False, help_text='Can cancel seat allocations')
    
    def save(self, *args, **kwargs):
        # Set permissions based on role
        if self.is_superuser or self.is_staff:
            self.role = 'admin'
        
        # Apply permission templates
        if self.role == 'admin':
            self.can_modify_seat_allocation = True
            self.can_cancel_seats = True
        elif self.role == 'volunteer':
            self.can_modify_seat_allocation = True
<<<<<<< HEAD
            self.can_cancel_seats = False
=======
            self.can_cancel_seats = False  # Volunteers can't delete/cancel by default
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
        else:  # viewer
            self.can_modify_seat_allocation = False
            self.can_cancel_seats = False
        
        super().save(*args, **kwargs)
    
<<<<<<< HEAD
    def get_role_from_groups(self):
        """Get user role from groups"""
        if self.groups.filter(name='Admin').exists():
            return 'admin'
        elif self.groups.filter(name='Volunteer').exists():
            return 'volunteer'
        elif self.groups.filter(name='Viewer').exists():
            return 'viewer'
        return self.role  # fallback to role field
    
=======
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    def get_permission_template(self):
        """Get permission template for role"""
        templates = {
            'admin': {
                'can_modify_seat_allocation': True,
                'can_cancel_seats': True,
                'description': 'Full access - can modify seats and cancel bookings'
            },
            'volunteer': {
                'can_modify_seat_allocation': True,
                'can_cancel_seats': False,
                'description': 'Limited access - can modify seats but cannot cancel bookings'
            },
            'viewer': {
                'can_modify_seat_allocation': False,
                'can_cancel_seats': False,
                'description': 'Read-only access - cannot modify anything'
            }
        }
        return templates.get(self.role, templates['viewer'])

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=100)
    department = models.CharField(max_length=50, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.full_name} - {self.user.role}"