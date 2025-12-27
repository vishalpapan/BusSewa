from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from authentication.models import User
from bookings.models import Booking, Payment, Bus
from passengers.models import Passenger

class Command(BaseCommand):
    help = 'Create user groups with appropriate permissions'

    def handle(self, *args, **options):
        # Create Admin Group
        admin_group, created = Group.objects.get_or_create(name='BusSewa Admin')
        if created:
            # Admin gets all permissions
            all_permissions = Permission.objects.all()
            admin_group.permissions.set(all_permissions)
            self.stdout.write(f"Created Admin group with {all_permissions.count()} permissions")
        
        # Create Volunteer Group  
        volunteer_group, created = Group.objects.get_or_create(name='BusSewa Volunteer')
        if created:
            # Volunteer gets limited permissions
            volunteer_permissions = []
            
            # Can view and change (but not delete) most things
            models = [Booking, Payment, Bus, Passenger, User]
            for model in models:
                content_type = ContentType.objects.get_for_model(model)
                # Add view and change permissions
                view_perm = Permission.objects.get(content_type=content_type, codename=f'view_{model._meta.model_name}')
                change_perm = Permission.objects.get(content_type=content_type, codename=f'change_{model._meta.model_name}')
                volunteer_permissions.extend([view_perm, change_perm])
                
                # Add add permission for bookings and payments
                if model in [Booking, Payment]:
                    add_perm = Permission.objects.get(content_type=content_type, codename=f'add_{model._meta.model_name}')
                    volunteer_permissions.append(add_perm)
            
            volunteer_group.permissions.set(volunteer_permissions)
            self.stdout.write(f"Created Volunteer group with {len(volunteer_permissions)} permissions")
        
        # Create Viewer Group
        viewer_group, created = Group.objects.get_or_create(name='BusSewa Viewer')
        if created:
            # Viewer gets only view permissions
            viewer_permissions = []
            models = [Booking, Payment, Bus, Passenger, User]
            for model in models:
                content_type = ContentType.objects.get_for_model(model)
                view_perm = Permission.objects.get(content_type=content_type, codename=f'view_{model._meta.model_name}')
                viewer_permissions.append(view_perm)
            
            viewer_group.permissions.set(viewer_permissions)
            self.stdout.write(f"Created Viewer group with {len(viewer_permissions)} permissions")
        
        # Update existing users based on their role
        for user in User.objects.all():
            user.groups.clear()  # Remove existing groups
            
            if user.role == 'admin':
                user.groups.add(admin_group)
                user.can_modify_seat_allocation = True
                user.can_cancel_seats = True
            elif user.role == 'volunteer':
                user.groups.add(volunteer_group)
                user.can_modify_seat_allocation = True
                user.can_cancel_seats = False
            else:  # viewer
                user.groups.add(viewer_group)
                user.can_modify_seat_allocation = False
                user.can_cancel_seats = False
            
            user.save()
            self.stdout.write(f"Updated {user.username} ({user.role}) - added to appropriate group")
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created groups and updated users!')
        )