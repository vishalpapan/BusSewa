# BusSewa - Feature Roadmap & Decisions

## 🎯 Current Week Priority (MVP)

### Phase 1: Core Booking System ⭐ HIGH PRIORITY
- [x] Passenger registration
- [x] Passenger list with search
- [ ] **Basic booking creation** (passenger + journey details)
- [ ] **Pickup points management**
- [ ] **Age-based pricing calculation**

### Phase 2: Seat Management 🚌 MEDIUM PRIORITY
- [ ] **Flexible bus capacity** (configurable 42+ seats)
- [ ] **Senior citizen priority seating** (front seats auto-allocation)
- [ ] **Bus number assignment** (after operator confirmation)

## 🤔 Strategic Decisions

### 1. Seat Allocation Timing
**RECOMMENDATION: Two-stage approach**
- **Stage 1:** Book passengers without specific seats (this week)
- **Stage 2:** Assign seats later when bus details confirmed
- **Why:** Bus layout/capacity not finalized yet

### 2. Google Sheets/Excel Integration 📊
**PRIORITY: LOW (End of project)**
- **Options:** 
  - Google Sheets API integration
  - Excel export functionality
  - Real-time dashboard sync
- **Timeline:** After core booking system complete

### 3. SMS/WhatsApp Notifications 📱
**PRIORITY: MEDIUM (Week 2-3)**
- **SMS:** Twilio integration (paid service)
- **WhatsApp:** WhatsApp Business API
- **Free Alternative:** Email notifications first

## 📋 This Week Focus

### Day 3-4: Booking Workflow
1. **Create booking form** (link passenger to journey)
2. **Pickup points CRUD**
3. **Age-based pricing rules**
4. **Basic booking list**

### Day 5-6: Bus Management
1. **Bus model** (number, capacity, route)
2. **Seat allocation algorithm** (seniors get priority)
3. **Booking-to-bus assignment**

### Day 7: Polish & Testing
1. **End-to-end testing**
2. **Basic reports**
3. **Export to Excel** (simple download)

## 🎓 Learning Progression
- **This Week:** Core Django/React patterns
- **Next Week:** Advanced features (notifications, integrations)
- **Week 3:** Production deployment & optimization