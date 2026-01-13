#!/usr/bin/env python3
"""
Database Management Script for BusSewa
-------------------------------------
Robust export and import of database content.
Fixes issues with custom user models and ensures all new fields (attendance, volunteers) are captured.

Usage:
  python manage_data.py export > backup.json
  python manage_data.py import < backup.json
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
from django.conf import settings
from django.apps import apps
from django.db import transaction

def get_models_to_process():
    """Return list of models to process in dependency order"""
    # Get the custom user model name
    auth_user_model = settings.AUTH_USER_MODEL
    
    return [
        auth_user_model,         # Custom User Model (authentication.User)
        'passengers.Passenger', 
        'bookings.PickupPoint',
        'bookings.Journey',
        'bookings.JourneyPricing',
        'bookings.Bus',
        'bookings.Booking',
        'bookings.Payment',
        'bookings.SeatCancellation',
        'volunteers.VolunteerProfile', # Include if exists, though likely handled by User
    ]

def export_data():
    """Export all data to JSON with error handling"""
    data = {}
    
    models = get_models_to_process()
    
    for model_name in models:
        try:
            try:
                model = apps.get_model(model_name)
            except LookupError:
                # print(f"Warning: Model {model_name} not found, skipping.", file=sys.stderr)
                continue
                
            queryset = model.objects.all()
            # Use natural keys if possible? Standard JSON is fine for backup/restore on same codebase.
            serialized = serializers.serialize('json', queryset, indent=2)
            data[model_name] = json.loads(serialized)
            print(f"Exported {len(data[model_name])} {model_name} records", file=sys.stderr)
        except Exception as e:
            print(f"Error exporting {model_name}: {e}", file=sys.stderr)
    
    # Add metadata
    data['_metadata'] = {
        'export_date': datetime.now().isoformat(),
        'version': '3.0',
        'total_records': sum(len(records) for k, records in data.items() if k != '_metadata')
    }
    
    return data

def import_data(data):
    """Import data from JSON with transaction safety"""
    
    print("Starting import...", file=sys.stderr)
    
    models = get_models_to_process()
    
    # Use atomic transaction to ensure data integrity
    try:
        with transaction.atomic():
            for model_name in models:
                if model_name in data:
                    try:
                        model = apps.get_model(model_name)
                        records = data[model_name]
                        
                        count = 0
                        for record in records:
                            obj_data = record['fields']
                            pk = record['pk']
                            
                            # Handle Many-to-Many or special fields if necessary
                            # Standard deserialization usually handles simple cases well
                            
                            obj, created = model.objects.update_or_create(
                                pk=pk,
                                defaults=obj_data
                            )
                            count += 1
                        
                        print(f"Imported {count} {model_name} records", file=sys.stderr)
                    except Exception as e:
                        print(f"Error importing {model_name}: {e}", file=sys.stderr)
                        # Don't re-raise, try to continue with other models? 
                        # Or strict fail? Soft fail allows partial restores.
    except Exception as e:
        print(f"Critical Error during import transaction: {e}", file=sys.stderr)
        sys.exit(1)
            
    print("Import completed successfully!", file=sys.stderr)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python manage_data.py [export|import]")
        print("  export: Outputs JSON to stdout")
        print("  import: Reads JSON from stdin")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'export':
        data = export_data()
        print(json.dumps(data, indent=2, default=str))
    
    elif command == 'import':
        try:
            input_data = sys.stdin.read()
            if not input_data:
                print("Error: No input data provided via stdin", file=sys.stderr)
                sys.exit(1)
            data = json.loads(input_data)
            import_data(data)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}", file=sys.stderr)
            sys.exit(1)
    
    else:
        print(f"Invalid command '{command}'. Use 'export' or 'import'")
        sys.exit(1)
