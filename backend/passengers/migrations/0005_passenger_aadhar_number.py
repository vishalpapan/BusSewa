# Generated migration for adding aadhar_number field

from django.db import migrations, models
import passengers.validators


class Migration(migrations.Migration):

    dependencies = [
        ('passengers', '0004_alter_passenger_related_to_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='passenger',
            name='aadhar_number',
            field=models.CharField(blank=True, help_text='12-digit Aadhar number', max_length=12, validators=[passengers.validators.validate_aadhar_number]),
        ),
    ]