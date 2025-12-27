# BusSewa - Bus Booking System v2.0

A journey-based bus booking and passenger management system built with Django REST Framework and React.

## Features

- Journey-based booking system with separate onward/return management
- Enhanced passenger registration with age-based criteria
- 42-seat visual layout with senior citizen priority seating
- Dynamic pricing based on age criteria and journey type
- Real-time booking management with conflict prevention
- Journey-wise data export to CSV/Excel
- Admin dashboard with journey statistics

## Tech Stack

**Backend**: Django REST Framework, PostgreSQL/SQLite
**Frontend**: React, TypeScript, Axios
**Authentication**: Session-based with CORS support

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python create_simple_admin.py
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Default Login
**Username**: admin
**Password**: admin123

## System Specifications

- Current Capacity: 15-20 concurrent users (SQLite)
- Production Capacity: 1000+ users (PostgreSQL)
- Session Timeout: 8 hours
- Seat Layout: 42 seats with priority allocation
- Journey Types: Onward, Return, or Both

## Project Structure
```
BusSewa/
├── backend/
│   ├── authentication/     # User management
│   ├── passengers/         # Passenger models with age criteria
│   ├── bookings/          # Journey-based booking system
│   ├── bussewa_api/       # Main Django app
│   └── export_db.py       # Database migration tool
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API calls
│   │   └── config/        # App configuration
│   └── public/
├── IMPORT_TEMPLATE.csv    # Data import template
└── ARCHITECTURE.md        # Technical documentation
```

## Configuration

### App Branding
Update `frontend/src/config/app.config.ts` to change app name, organization, and branding.

### Database Migration
```bash
# Export current database
python export_db.py export > backup.json

# Import to new instance
python export_db.py import < backup.json
```

## Production Deployment

1. Switch to PostgreSQL for production
2. Configure environment variables
3. Use Nginx + Gunicorn for serving
4. Set up SSL certificate

See ARCHITECTURE.md for detailed deployment guide.

## Version 2.0 Features

- Journey Manager for date and pricing configuration
- Age-based pricing with automatic calculation
- Enhanced seat layout with priority seating
- Journey statistics and revenue tracking
- Enhanced export with journey-specific data

---

**Built for MSS 2026** | **Version 2.0** | **Production Ready**
