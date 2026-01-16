#!/usr/bin/env python3
"""
Database Export/Import Script for BusSewa
Usage:
  python export_db.py export > backup.json
  python export_db.py import < backup.json
"""

import os
import sys
import django
import json
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bussewa_api.settings')
django.setup()

from django.core import serializers
from django.apps import apps

def export_data():
    """Export all data to JSON"""
    data = {}
    
    # Models to export in order (to handle dependencies)
    models_to_export = [
        'auth.User',
        'authentication.UserProfile',
        'volunteers.Volunteer',
        'passengers.Passenger', 
        'bookings.PickupPoint',
        'bookings.Journey',
        'bookings.JourneyPricing',
        'bookings.Bus',
        'bookings.OnSpotPassenger',
        'bookings.Booking',
        'bookings.Payment',
        'bookings.SeatCancellation'
    ]
    
    for model_name in models_to_export:
        try:
            model = apps.get_model(model_name)
            queryset = model.objects.all()
            serialized = serializers.serialize('json', queryset)
            data[model_name] = json.loads(serialized)
            print(f"Exported {len(data[model_name])} {model_name} records", file=sys.stderr)
        except Exception as e:
            print(f"Error exporting {model_name}: {e}", file=sys.stderr)
    
    # Add metadata
    data['_metadata'] = {
        'export_date': datetime.now().isoformat(),
        'version': '2.0',
        'total_records': sum(len(records) for records in data.values() if isinstance(records, list))
    }
    
    return data

def import_data(data):
    """Import data from JSON"""
    from django.core.management import call_command
    
    print("Starting import...", file=sys.stderr)
    
    models_order = [
        'auth.User',
        'authentication.UserProfile',
        'volunteers.Volunteer',
        'passengers.Passenger',
        'bookings.PickupPoint', 
        'bookings.Journey',
        'bookings.JourneyPricing',
        'bookings.Bus',
        'bookings.OnSpotPassenger',
        'bookings.Booking',
        'bookings.Payment',
        'bookings.SeatCancellation'
    ]
    
    for model_name in models_order:
        if model_name in data:
            try:
                model = apps.get_model(model_name)
                records = data[model_name]
                
                for record in records:
                    obj_data = record['fields']
                    obj_data['pk'] = record['pk']
                    
                    obj, created = model.objects.get_or_create(
                        pk=obj_data['pk'],
                        defaults=obj_data
                    )
                    if not created:
                        for key, value in obj_data.items():
                            setattr(obj, key, value)
                        obj.save()
                
                print(f"Imported {len(records)} {model_name} records", file=sys.stderr)
            except Exception as e:
                print(f"Error importing {model_name}: {e}", file=sys.stderr)
    
    print("Import completed!", file=sys.stderr)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python export_db.py [export|import]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'export':
        data = export_data()
        print(json.dumps(data, indent=2, default=str))
    
    elif command == 'import':
        data = json.load(sys.stdin)
        import_data(data)
    
    else:
        print("Invalid command. Use 'export' or 'import'")
        sys.exit(1)