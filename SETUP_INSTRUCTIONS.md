# BusSewa - Quick Setup Instructions

## 🚀 Running on Another System

### Prerequisites:
- Python 3.8+ installed
- Node.js 16+ installed
- Git installed

### Setup Steps:

#### 1. Clone/Copy Project
```bash
# Option A: Clone from repository
git clone <repository-url>
cd BusSewa

# Option B: Copy entire BusSewa folder to new system
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

#### 3. Frontend Setup (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start frontend server
npm start
```

#### 4. Access Application
- **Frontend:** http://localhost:3000
- **Backend Admin:** http://localhost:8000/admin
- **API:** http://localhost:8000/api

## 📋 Testing Checklist

### Data Entry Test:
1. ✅ Add passengers with different age categories
2. ✅ Upload Aadhar documents (PDF/Images)
3. ✅ Create bookings for passengers
4. ✅ Record payments with volunteer names
5. ✅ Export data to Excel/CSV

### File Upload Test:
1. ✅ Upload PDF Aadhar document
2. ✅ Upload JPG/PNG image
3. ✅ Check file size validation (max 5MB)
4. ✅ Verify files saved in backend/media/aadhar_documents/

### Export Test:
1. ✅ Export passengers list
2. ✅ Export bookings list
3. ✅ Export complete report
4. ✅ Open CSV in Excel and verify formatting

## 🔧 Troubleshooting

### Common Issues:

#### Backend won't start:
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt

# Check for port conflicts
netstat -an | findstr :8000
```

#### Frontend won't start:
```bash
# Check Node version
node --version  # Should be 16+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### File uploads not working:
```bash
# Check media directory exists
mkdir -p backend/media/aadhar_documents

# Check file permissions (Linux/Mac)
chmod 755 backend/media
```

## 📊 Sample Data for Testing

### Add these pickup points in Django admin:
1. Sea Corner
2. Parel ST Depot
3. Kirti Mahal, Parel
4. BMC Office, Worli Naka
5. Peninsula Signal

### Add these volunteers in Django admin:
1. Ashish Baki
2. Prashant
3. Gaurav
4. Rohit
5. Abhi

### Test with sample passengers:
- **Senior Citizen:** Age 70, Male (should get ₹290 price)
- **Adult Male:** Age 35 (should get ₹550 price)
- **Female:** Age 45 (should get ₹290 price)
- **Child:** Age 8 (should get ₹290 price)

## 🎯 Quick Demo Script

1. **Dashboard:** Show overview statistics
2. **Add Passenger:** Create passenger with document upload
3. **Create Booking:** Quick booking from passenger list
4. **Record Payment:** Use volunteer dropdown
5. **Export Data:** Download complete report
6. **Admin Panel:** Show document management

**Total demo time: 5-10 minutes**