from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        # This migration ensures User model has proper groups and permissions
        # No actual schema changes needed as AbstractUser already has these
    ]