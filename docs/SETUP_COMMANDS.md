# BusSewa - Setup Commands Reference

## 🚀 Quick Start Commands

### Backend (Django) - Terminal 1
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```
**Expected:** Django server at http://127.0.0.1:8000/

### Frontend (React) - Terminal 2
```bash
cd frontend
npx create-react-app . --template typescript
npm start
```
**Expected:** React app at http://localhost:3000/

## ✅ Verification Steps

### Backend Working?
- Visit: http://127.0.0.1:8000/
- Should see: Django welcome page with rocket

### Frontend Working?
- Visit: http://localhost:3000/
- Should see: React spinning logo

## 🎯 Phase-by-Phase Development Timeline

### Phase 1: Basic Booking (2-3 weeks)
- **Week 1:** Authentication + Basic Models
- **Week 2:** Passenger Registration Form
- **Week 3:** Simple Booking System + Testing

### Phase 2: Enhanced Features (2-3 weeks)
- **Week 4:** Seat Map Component
- **Week 5:** Document Upload
- **Week 6:** Integration Testing

### Phase 3: Advanced Features (2-3 weeks)
- **Week 7:** Family Grouping
- **Week 8:** Advanced UI/UX
- **Week 9:** Final Testing + Documentation

**Total Timeline: 6-9 weeks (learning + development)**

## 📝 Current Status
- [x] Backend Django server running
- [ ] Frontend React app setup
- [ ] Both servers communicating