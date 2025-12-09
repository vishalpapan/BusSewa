# 🚌 BusSewa - Bus Booking Management System

A comprehensive web application for managing bus bookings, passenger registration, seat allocation, and payment tracking for MSS 2025 events.

## ✨ Key Features

### Core Features
- **👥 Passenger Management** - Register passengers with Aadhar number validation
- **🎫 Booking System** - Create bookings with automatic age-based pricing
- **💰 Payment Tracking** - Record payments with multiple payment methods
- **🪑 Seat Allocation** - Visual 40-seat bus layout with smart assignment
- **📊 Live Dashboard** - Real-time statistics and passenger tracking
- **📤 Data Export** - Enhanced CSV export with proper formatting
- **📥 Data Import** - Bulk passenger import via CSV
- **👨‍👩‍👧‍👦 Family Grouping** - Link related passengers for adjacent seating
- **🔐 Authentication** - Role-based access (Admin, Volunteer, Viewer)

### New Features (Latest Update)
- ✅ **Aadhar Number Integration** - 12-digit validation and export
- ✅ **40-Seat Bus Configuration** - Updated from 42 to 40 seats
- ✅ **Enhanced CSV Export** - UTF-8 BOM, Indian date format, currency symbols
- ✅ **Session Persistence** - No logout on page refresh
- ✅ **Multi-Bus Management** - Support for multiple buses
- ✅ **Smart Seat Assignment** - Priority seating for seniors (65+)

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 4.2.7 + Django REST Framework
- **Database:** SQLite (development) / PostgreSQL (production)
- **Authentication:** Custom User model with role-based access
- **API:** RESTful API with session authentication

### Frontend
- **Framework:** React 18 with TypeScript
- **State Management:** React Hooks
- **Styling:** Inline styles with responsive design
- **HTTP Client:** Fetch API with credentials

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- Git

### Windows Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd BusSewa
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

#### 3. Frontend Setup (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Linux/Mac Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd BusSewa
```

#### 2. Backend Setup
```bash
cd backend

# Install Python virtual environment
sudo apt update
sudo apt install -y python3-venv python3-pip

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

#### 3. Frontend Setup (New Terminal)
```bash
cd frontend

# Install Node.js if not installed
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install

# Start development server
npm start
```

### Access Application
- **Frontend:** http://localhost:3000
- **Backend Admin:** http://localhost:8000/admin
- **API:** http://localhost:8000/api

## 📋 Initial Setup

### 1. Create Admin User
```bash
cd backend
python manage.py createsuperuser
# Enter username, email, and password
```

### 2. Add Pickup Points (via Django Admin)
1. Go to http://localhost:8000/admin
2. Navigate to Bookings → Pickup Points
3. Add locations:
   - Sea Corner
   - Parel ST Depot
   - Kirti Mahal, Parel
   - BMC Office, Worli Naka
   - Peninsula Signal

### 3. Create Buses (via Django Admin)
1. Navigate to Bookings → Buses
2. Add buses with:
   - Bus Number (e.g., MH-01-AB-1234)
   - Capacity: 40
   - Route Name (optional)

### 4. User Management
- **Create users via Django Admin** at http://localhost:8000/admin
- **Assign roles:** Admin, Volunteer, or Viewer
- **Set permissions** based on role requirements

## 🎯 User Roles & Permissions

| Feature | Admin | Volunteer | Viewer |
|---------|-------|-----------|--------|
| Add/Edit Passengers | ✅ | ✅ | ❌ |
| Create Bookings | ✅ | ✅ | ❌ |
| Record Payments | ✅ | ✅ | ❌ |
| Seat Allocation | ✅ | ✅ | ❌ |
| Delete Passengers | ✅ | ❌ | ❌ |
| Manage Buses | ✅ | ❌ | ❌ |
| Export Data | ✅ | ✅ | ✅ |
| Import Data | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ |

## 📊 Pricing Logic

| Age Category | Price |
|-------------|-------|
| M-12 & Below | ₹290 |
| F-12 & Below | ₹290 |
| M-65 & Above | ₹290 |
| F-Above 12 & Below 75 | ₹290 |
| M&F-75 & Above | Free |
| M-Above 12 & Below 65 | ₹550 |

## 🪑 Seat Allocation

### 40-Seat Bus Layout
- **Total Seats:** 40 (10 rows × 4 seats)
- **Layout:** 2+2 configuration with aisle
- **Numbering:** Sequential 1-40
- **Priority Seating:** Seniors (65+) get front seats (1-8)

### Smart Assignment Features
- Automatic seat suggestions based on age
- Family members get adjacent seats
- Bus selection mandatory before allocation
- Visual seat map with color coding

## 📤 Data Export Features

### Enhanced CSV Export
- **UTF-8 BOM encoding** for Excel compatibility
- **Indian date format** (DD/MM/YYYY)
- **Currency symbols** (₹) with proper formatting
- **Proper escaping** for special characters
- **Serial numbers** in all exports
- **Aadhar numbers** included in passenger exports

### Export Options
1. **Passengers List** - All passenger details with Aadhar
2. **Bookings List** - Booking details with seat assignments
3. **Payments List** - Payment records with methods
4. **Complete Report** - Comprehensive data export

## 📥 Data Import

### CSV Import Features
- **Template download** with correct format
- **Field validation** before import
- **Error reporting** for invalid data
- **Bulk passenger creation**

### Required CSV Columns
- Name, Age, Gender, Mobile Number
- Age Criteria (exact match required)
- Aadhar Number (12 digits)
- Address, Pickup Point

## 🏗️ Project Structure

```
BusSewa/
├── backend/
│   ├── authentication/      # User authentication & roles
│   ├── passengers/          # Passenger management
│   ├── bookings/           # Bookings, buses, payments
│   ├── bussewa_api/        # Main Django settings
│   ├── requirements.txt    # Python dependencies
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx         # Main app with auth
│   │   └── index.tsx
│   ├── package.json
│   └── public/
└── README.md
```

## 🔧 Configuration

### Backend Settings (settings.py)
```python
# Session Configuration
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_SAVE_EVERY_REQUEST = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True

# Custom User Model
AUTH_USER_MODEL = 'authentication.User'
```

## 🧪 Testing

### Test Scenarios
1. ✅ Passenger registration with Aadhar validation
2. ✅ Booking creation with auto-pricing
3. ✅ Seat allocation with bus selection
4. ✅ Payment recording with multiple methods
5. ✅ CSV export with proper formatting
6. ✅ CSV import with validation
7. ✅ Family grouping with adjacent seats
8. ✅ Session persistence across page refresh

### Sample Test Data
```
Senior Citizen: Age 70, Male → ₹290
Adult Male: Age 35 → ₹550
Female: Age 45 → ₹290
Child: Age 8 → ₹290
Senior (75+): Age 80 → Free
```

## 🚀 Deployment

### Development
```bash
# Backend
cd backend
python manage.py runserver

# Frontend
cd frontend
npm start
```

### Production Checklist
- [ ] Set `DEBUG = False` in settings.py
- [ ] Configure proper `SECRET_KEY`
- [ ] Set up PostgreSQL database
- [ ] Configure static files serving
- [ ] Set up Nginx/Apache reverse proxy
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure CORS for production domain
- [ ] Set up backup strategy

## 🔒 Security Features

- **Role-based access control** (Admin, Volunteer, Viewer)
- **Session-based authentication** with CSRF protection
- **Password hashing** with Django's built-in system
- **Aadhar number validation** (12-digit format)
- **Input sanitization** for all user inputs
- **Secure file uploads** with validation

## 📝 API Endpoints

### Authentication
- `POST /auth/login/` - User login
- `POST /auth/logout/` - User logout
- `GET /auth/current-user/` - Get current user info

### Passengers
- `GET /api/passengers/` - List all passengers
- `POST /api/passengers/` - Create passenger
- `GET /api/passengers/{id}/` - Get passenger details
- `PUT /api/passengers/{id}/` - Update passenger
- `DELETE /api/passengers/{id}/` - Delete passenger (Admin only)

### Bookings
- `GET /api/bookings/` - List all bookings
- `POST /api/bookings/` - Create booking
- `PATCH /api/bookings/{id}/` - Update booking (seat allocation)

### Buses
- `GET /api/buses/` - List all buses
- `POST /api/buses/` - Create bus (Admin only)

## 🆘 Troubleshooting

### Backend Issues
```bash
# Port already in use
python manage.py runserver 8001

# Database locked
rm db.sqlite3
python manage.py migrate

# Missing dependencies
pip install -r requirements.txt
```

### Frontend Issues
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Port already in use
# Edit package.json: "start": "PORT=3001 react-scripts start"
```

### Authentication Issues
- Clear browser cookies and localStorage
- Restart both backend and frontend servers
- Check CORS settings in settings.py

## 📈 Future Enhancements

- [ ] SMS/WhatsApp notifications for bookings
- [ ] QR code generation for tickets
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-event support
- [ ] Payment gateway integration
- [ ] Automated seat optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built for MSS 2025 event management
- Designed for efficient bus booking operations
- Optimized for volunteer-friendly interface

---

**Built with ❤️ for MSS Events | Version 2.0**
