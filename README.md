# BusSewa - Bus Booking System v3.1

A journey-based bus booking and passenger management system built with Django REST Framework and React.

## Features

- Journey-based booking system with separate onward/return management
- Enhanced passenger registration with age-based criteria
- **Dynamic Bus Capacity**: Configurable seat layout (default 40).
- **Volunteer Management**: Assign volunteers and track their status.
- **Attendance Tracking**: Mark presence/absence and shift passengers between buses.
- **Enhanced Export**: Include volunteer status and attendance data.
- **Delete Management**: Admin-only feature to permanently delete bookings.
- **Secure API**: Role-based access control for all operations.
- Real-time booking management with conflict prevention
- Admin dashboard with journey statistics

## Tech Stack

**Backend**: Django REST Framework, PostgreSQL/SQLite
**Frontend**: React, TypeScript, Axios
**Authentication**: Session-based with CORS support

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup

#### Windows
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python create_simple_admin.py
python manage.py runserver
```

#### Linux/Mac
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python create_simple_admin.py
python manage.py runserver
```

### Frontend Setup (All Platforms)
```bash
cd frontend
npm install
npm start
```

### Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Default Login
**Username**: admin
**Password**: admin123

## System Specifications

- Current Capacity: 15-20 concurrent users (SQLite)
- Production Capacity: 1000+ users (PostgreSQL)
- Session Timeout: 8 hours
- Seat Layout: Dynamic (Default 40)
- Journey Types: Onward, Return, or Both

## Project Structure
```
BusSewa/
├── backend/
│   ├── authentication/     # User management
│   ├── passengers/         # Passenger models with age criteria
│   ├── bookings/          # Journey-based booking system
│   ├── bussewa_api/       # Main Django app
│   └── export_db.py       # Database backup/restore tool
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API calls
│   │   └── config/        # App configuration
│   └── public/
├── IMPORT_TEMPLATE.csv    # Data import template
├── ARCHITECTURE.md        # Technical documentation
└── DATA_MANAGEMENT.md     # Backup & Restore guide
```

## Configuration

### App Branding
Update `frontend/src/config/app.config.ts` to change app name, organization, and branding.

### Database Migration
See [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md) for detailed instructions.
```bash
# Export current database (run from backend directory)
cd backend
python export_db.py export > ../backup.json

# Import to new instance
# cd backend
# python export_db.py import < ../backup.json
```

## Production Deployment

1. Switch to PostgreSQL for production
2. Configure environment variables
3. Use Nginx + Gunicorn for serving
4. Set up SSL certificate

See ARCHITECTURE.md for detailed deployment guide.

## HTTPS / SSL Configuration (Important)
AWS EC2 DNS addresses (`ec2-xx...amazonaws.com`) **do not support free SSL (Let's Encrypt)** directly. To enable HTTPS:
1.  **Purchase a Domain**: Buy a domain (e.g., `mybussewa.com`) from Godaddy/Namecheap (~$10/yr).
2.  **Point to AWS**: Create an `A Record` in your domain DNS content pointing to your AWS Elastic IP.
3.  **Install SSL**: SSH into the server and run `sudo certbot --nginx -d mybussewa.com`.
4.  **Done**: Your site will now be secure (`https://mybussewa.com`).

## Version 3.0 Features (New)

- **Volunteer Designation**: Mark passengers as volunteers with visual indicators.
- **Dynamic Bus Capacity**: Set different seat counts per bus (e.g., 30, 40, 50).
- **Attendance Dashboard**: interactive tool to mark attendance and manage bus shifts.
- **Enhanced Data Management**: New `manage_data.py` script and `DATA_MANAGEMENT.md` guide.

## Version 2.0 Features

- Journey Manager for date and pricing configuration
- Age-based pricing with automatic calculation
- Enhanced seat layout with priority seating
- Journey statistics and revenue tracking
- Enhanced export with journey-specific data

---

**Built for MSS 2026** | **Version 3.1** | **Production Ready**
