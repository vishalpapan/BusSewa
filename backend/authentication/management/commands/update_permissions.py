from django.core.management.base import BaseCommand
from authentication.models import User

class Command(BaseCommand):
    help = 'Update user permissions based on role templates'

    def handle(self, *args, **options):
        users = User.objects.all()
        updated_count = 0
        
        for user in users:
            old_modify = user.can_modify_seat_allocation
            old_cancel = user.can_cancel_seats
            
            # Apply role-based permissions
            if user.role == 'admin':
                user.can_modify_seat_allocation = True
                user.can_cancel_seats = True
            elif user.role == 'volunteer':
                user.can_modify_seat_allocation = True
                user.can_cancel_seats = False
            else:  # viewer
                user.can_modify_seat_allocation = False
                user.can_cancel_seats = False
            
            # Save if changed
            if (old_modify != user.can_modify_seat_allocation or 
                old_cancel != user.can_cancel_seats):
                user.save()
                updated_count += 1
                self.stdout.write(
                    f"Updated {user.username} ({user.role}): "
                    f"modify_seats={user.can_modify_seat_allocation}, "
                    f"cancel_seats={user.can_cancel_seats}"
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated_count} users')
        )