<<<<<<< HEAD
# 🚌 BusSewa - Bus Booking Management System

A comprehensive web application for managing bus bookings, passenger registration, and payment tracking for MSS events.

## 🎯 Features

- **👥 Passenger Management** - Register passengers with document verification
- **🎫 Booking System** - Create bookings with automatic age-based pricing
- **💰 Payment Tracking** - Record payments with volunteer management
- **📊 Dashboard** - Real-time statistics and analytics
- **📤 Data Export** - Export to Excel/CSV for reporting
- **📱 Document Upload** - Aadhar card verification (PDF/Images)
=======
# 🚌 BusSewa - Bus Booking System v1.0

A comprehensive bus booking and passenger management system built with Django REST Framework and React for MSS 2026.

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

### v1.0 Features
- ✅ **Superuser-only Authentication** - Simplified access control
- ✅ **40-Seat Visual Layout** - Interactive seat selection
- ✅ **Real-time Booking Management** - Conflict prevention
- ✅ **Enhanced CSV Export** - Custom column selection
- ✅ **Safe Data Management** - Cancel booking instead of delete
- ✅ **Admin Delete Interface** - Separate deletion management
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 4.2.7 + Django REST Framework
- **Database:** SQLite (development) / PostgreSQL (production)
<<<<<<< HEAD
- **File Storage:** Local media files with secure upload validation
- **Authentication:** Django built-in auth system

### Frontend
- **Framework:** React 18 with TypeScript
- **HTTP Client:** Axios for API communication
- **Styling:** Inline styles with responsive design
- **File Upload:** Native HTML5 file input with validation
=======
- **Authentication:** Custom User model with role-based access
- **API:** RESTful API with session authentication

### Frontend
- **Framework:** React 18 with TypeScript
- **State Management:** React Hooks
- **Styling:** Inline styles with responsive design
- **HTTP Client:** Fetch API with credentials
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498

## 🚀 Quick Start

### Prerequisites
<<<<<<< HEAD
- Python 3.8+
- Node.js 16+
- Git

### Installation
=======
- Python 3.8+ 
- Node.js 16+
- Git

### Windows Setup
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498

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
<<<<<<< HEAD
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
=======
venv\Scripts\activate
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

<<<<<<< HEAD
# Create superuser
=======
# Create superuser (admin)
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
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

<<<<<<< HEAD
#### 4. Access Application
- **Frontend:** http://localhost:3000
- **Backend Admin:** http://localhost:8000/admin
- **API Documentation:** http://localhost:8000/api

## 📋 Usage Guide

### Initial Setup
1. **Add Pickup Points** in Django admin (Sea Corner, Parel ST Depot, etc.)
2. **Add Volunteers** in Django admin (Ashish Baki, Prashant, Gaurav, etc.)
3. **Configure Age Categories** and pricing rules

### Daily Operations
1. **Register Passengers** with optional document upload
2. **Create Bookings** directly from passenger list
3. **Record Payments** using volunteer dropdown
4. **Export Reports** for bus operators and accounting
=======
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
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498

## 🏗️ Project Structure

```
BusSewa/
<<<<<<< HEAD
├── backend/                 # Django REST API
│   ├── bussewa_api/        # Main Django project
│   ├── passengers/         # Passenger management app
│   ├── bookings/          # Booking and payment app
│   ├── authentication/    # Volunteer management app
│   ├── media/             # Uploaded files (Aadhar documents)
│   ├── requirements.txt   # Python dependencies
│   └── manage.py          # Django management script
├── frontend/               # React TypeScript app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   └── App.tsx        # Main application component
│   ├── package.json       # Node.js dependencies
│   └── public/            # Static assets
├── docs/                   # Documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── FEATURE_ROADMAP.md
│   └── API_DOCUMENTATION.md
└── README.md              # This file
=======
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
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
```

## 🔧 Configuration

<<<<<<< HEAD
### Environment Variables
Create `.env` file in backend directory:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
```

### File Upload Settings
- **Max file size:** 5MB
- **Allowed formats:** PDF, JPG, JPEG, PNG, WEBP
- **Storage location:** `backend/media/aadhar_documents/`

## 📊 API Endpoints

### Passengers
- `GET /api/passengers/` - List all passengers
- `POST /api/passengers/` - Create new passenger
- `GET /api/passengers/{id}/` - Get passenger details
- `PUT /api/passengers/{id}/` - Update passenger
- `DELETE /api/passengers/{id}/` - Delete passenger

### Bookings
- `GET /api/bookings/` - List all bookings
- `POST /api/bookings/` - Create new booking
- `GET /api/bookings/{id}/` - Get booking details

### Payments
- `GET /api/payments/` - List all payments
- `POST /api/payments/` - Record new payment
=======
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
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498

## 🚀 Deployment

### Development
```bash
# Backend
<<<<<<< HEAD
python manage.py runserver

# Frontend
npm start
```

### Production (AWS Lightsail - Recommended)
1. **Launch $5/month Lightsail instance**
2. **Install dependencies** (Python, Node.js, Nginx)
3. **Deploy code** and configure Nginx
4. **Total cost:** ~$5/month for entire event

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🧪 Testing

### Sample Data
1. **Pickup Points:** Sea Corner, Parel ST Depot, Kirti Mahal
2. **Volunteers:** Ashish Baki, Prashant, Gaurav, Rohit
3. **Test Passengers:** Different age categories for pricing validation

### Test Scenarios
- ✅ Passenger registration with document upload
- ✅ Booking creation with auto-pricing
- ✅ Payment recording with volunteer tracking
- ✅ Data export to Excel/CSV
- ✅ File upload validation (size, format)

## 📈 Pricing Logic

| Age Category | Price |
|-------------|-------|
| Male 12 & Below | ₹290 |
| Female 12-75 | ₹290 |
| Male 65+ | ₹290 |
| 75+ (All) | Free |
| Adult Male (12-65) | ₹550 |
=======
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
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

<<<<<<< HEAD
## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation:** Check `docs/` directory
- **Issues:** Create GitHub issue
- **Setup Help:** Follow `SETUP_INSTRUCTIONS.md`

## 🎯 Roadmap

- [ ] **Phase 2:** Camera integration for document capture
- [ ] **Phase 3:** Seat management with visual bus layout
- [ ] **Phase 4:** SMS/WhatsApp notifications
- [ ] **Phase 5:** Advanced analytics and reporting
- [ ] **Phase 6:** Multi-event support

---

**Built with ❤️ for MSS Events**
=======
## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built for MSS 2025 event management
- Designed for efficient bus booking operations
- Optimized for volunteer-friendly interface

---

**Built with ❤️ for MSS 2026 | Version 1.0**
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
