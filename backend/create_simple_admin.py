import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bussewa_api.settings')
django.setup()

from django.contrib.auth import get_user_model
from authentication.models import UserProfile

User = get_user_model()

# Delete existing admin if exists
try:
    User.objects.filter(username='admin').delete()
except:
    pass

# Create simple admin user
admin = User(
    username='snmworli',
    email='admin@example.com',
    is_superuser=True,
    is_staff=True,
    is_active=True
)
admin.set_password('worli203')
admin.save()

# Create profile
try:
    UserProfile.objects.create(
        user=admin,
        full_name='Administrator'
    )
except:
    pass

print("✅ Admin user created!")
print("Username: snmworli")
print("Password: worli203")
print("Now restart Django server and login.")
