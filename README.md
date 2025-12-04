# 🚌 BusSewa - Bus Booking Management System

A comprehensive web application for managing bus bookings, passenger registration, and payment tracking for MSS events.

## 🎯 Features

- **👥 Passenger Management** - Register passengers with document verification
- **🎫 Booking System** - Create bookings with automatic age-based pricing
- **💰 Payment Tracking** - Record payments with volunteer management
- **📊 Dashboard** - Real-time statistics and analytics
- **📤 Data Export** - Export to Excel/CSV for reporting
- **📱 Document Upload** - Aadhar card verification (PDF/Images)

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 4.2.7 + Django REST Framework
- **Database:** SQLite (development) / PostgreSQL (production)
- **File Storage:** Local media files with secure upload validation
- **Authentication:** Django built-in auth system

### Frontend
- **Framework:** React 18 with TypeScript
- **HTTP Client:** Axios for API communication
- **Styling:** Inline styles with responsive design
- **File Upload:** Native HTML5 file input with validation

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Installation

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
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
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

## 🏗️ Project Structure

```
BusSewa/
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
```

## 🔧 Configuration

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

## 🚀 Deployment

### Development
```bash
# Backend
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

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

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