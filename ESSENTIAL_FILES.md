# BusSewa v2.0 - Essential Files Only

## Backend Files (Django)
```
BusSewa/backend/
├── manage.py
├── export_db.py                    # Database export/import
├── create_simple_admin.py          # Admin user creation
├── requirements.txt
├── bussewa_api/
│   ├── __init__.py
│   ├── settings.py                 # Main configuration
│   ├── urls.py
│   └── wsgi.py
├── authentication/
│   ├── __init__.py
│   ├── models.py                   # User model
│   ├── views.py                    # Login/logout
│   └── urls.py
├── passengers/
│   ├── __init__.py
│   ├── models.py                   # Passenger with age criteria
│   ├── serializers.py
│   ├── views.py
│   ├── validators.py
│   └── urls.py
└── bookings/
    ├── __init__.py
    ├── models.py                   # Journey-based booking system
    ├── serializers.py              # Journey serializers
    ├── views.py                    # Basic views
    ├── views_enhanced.py           # Journey management APIs
    └── urls.py
```

## Frontend Files (React)
```
BusSewa/frontend/
├── package.json
├── public/
│   ├── index.html                  # Page title & favicon
│   └── favicon.ico
└── src/
    ├── App.tsx                     # Main app with navigation
    ├── App.css
    ├── index.tsx
    ├── config/
    │   └── app.config.ts           # Centralized branding
    ├── services/
    │   └── api.ts                  # API calls
    └── components/
        ├── Login.tsx
        ├── Dashboard.tsx           # Journey-wise statistics
        ├── PassengerForm.tsx       # Enhanced with age field
        ├── PassengerList.tsx       # With booking navigation
        ├── BookingForm.tsx         # Journey-based booking
        ├── BookingList.tsx         # Journey display
        ├── SeatAllocation.tsx      # 42-seat layout
        ├── BusManager.tsx          # Journey-based buses
        ├── JourneyManager.tsx      # Journey dates & pricing
        ├── LivePassengerList.tsx   # Journey-specific lists
        ├── ExportData.tsx          # Enhanced export
        ├── PickupPointManager.tsx
        └── DeleteManagement.tsx
```

## Root Files
```
BusSewa/
├── README.md                       # Complete documentation
├── IMPORT_TEMPLATE.csv             # Data import template
└── VERSION_HISTORY.md              # Version tracking
```

## Files to EXCLUDE (not needed)
- `node_modules/` (frontend)
- `__pycache__/` (backend)
- `db.sqlite3` (database - use export script)
- `.git/` (version control)
- `media/` (uploaded files)
- `static/` (collected static files)
- Any `.pyc` files
- `GoogleSheetsIntegration.tsx` (optional)
- `ImportData.tsx` (keeping simple)
- `UserManagement.tsx` (not used)
- `VolunteerManagement.tsx` (not used)
```

**Total Essential Files**: ~35 files
**Size**: ~2-3 MB (without node_modules/database)

This gives you a clean, production-ready codebase with only essential files.