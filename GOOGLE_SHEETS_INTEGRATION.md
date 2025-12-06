# 📊 Google Sheets Integration - Implementation Guide

## Overview

Export data directly to Google Sheets in real-time or on-demand.

---

## 🎯 Two Approaches

### **Approach 1: Manual Export to Google Sheets (Simple)**
- User clicks "Export to Google Sheets"
- Downloads CSV
- User uploads to Google Sheets manually
- **Pros:** Simple, no API setup
- **Cons:** Manual step required

### **Approach 2: Auto-Sync to Google Sheets (Advanced)**
- Real-time sync to Google Sheets
- Automatic updates when data changes
- **Pros:** Fully automated
- **Cons:** Requires Google API setup

---

## 🚀 Approach 1: Manual Export (Recommended for Now)

### **Current Implementation:**
Your app already exports CSV files. Users can:

1. Click "Export Data" → "Complete Report"
2. Download CSV file
3. Open Google Sheets
4. File → Import → Upload CSV
5. Done!

**No code changes needed!** ✅

---

## 🔧 Approach 2: Auto-Sync Implementation

### **Step 1: Setup Google Sheets API**

#### **1.1 Create Google Cloud Project**
1. Go to https://console.cloud.google.com/
2. Create new project: "BusSewa"
3. Enable Google Sheets API
4. Enable Google Drive API

#### **1.2 Create Service Account**
1. Go to IAM & Admin → Service Accounts
2. Create service account: "bussewa-sheets"
3. Download JSON key file
4. Save as `backend/google-credentials.json`

#### **1.3 Share Google Sheet**
1. Create new Google Sheet
2. Share with service account email (from JSON)
3. Give "Editor" permission
4. Copy Sheet ID from URL

---

### **Step 2: Install Dependencies**

```bash
cd backend
pip install gspread oauth2client
pip freeze > requirements.txt
```

---

### **Step 3: Create Google Sheets Service**

Create `backend/bookings/google_sheets.py`:

```python
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from django.conf import settings
import os

class GoogleSheetsService:
    def __init__(self):
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        
        creds_path = os.path.join(settings.BASE_DIR, 'google-credentials.json')
        creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
        self.client = gspread.authorize(creds)
        
        # Your Google Sheet ID
        self.sheet_id = settings.GOOGLE_SHEET_ID
        self.sheet = self.client.open_by_key(self.sheet_id)
    
    def export_bookings(self, bookings_data):
        """Export bookings to Google Sheets"""
        try:
            worksheet = self.sheet.worksheet('Bookings')
        except:
            worksheet = self.sheet.add_worksheet('Bookings', rows=1000, cols=20)
        
        # Clear existing data
        worksheet.clear()
        
        # Headers
        headers = [
            'SR', 'Name', 'Gender', 'Age Criteria', 'Category', 
            'Mobile No', 'Onwards Date', 'Return Date', 'Pickup Point',
            'Seat Number', 'Calculated Price', 'Amount Received', 
            'Balance', 'Payment Method', 'Collected By', 'Status'
        ]
        
        # Prepare data
        data = [headers]
        for booking in bookings_data:
            data.append([
                booking.get('SR', ''),
                booking.get('Name', ''),
                booking.get('Gender', ''),
                booking.get('Age Criteria', ''),
                booking.get('Category', ''),
                booking.get('Mobile No', ''),
                booking.get('Onwards Date', ''),
                booking.get('Return Date', ''),
                booking.get('Pickup Point', ''),
                booking.get('Seat Number', ''),
                booking.get('Calculated Price', 0),
                booking.get('Amount Received', 0),
                booking.get('Balance', 0),
                booking.get('Payment Method', ''),
                booking.get('Collected By', ''),
                booking.get('Status', '')
            ])
        
        # Update sheet
        worksheet.update('A1', data)
        
        return True
    
    def export_passengers(self, passengers_data):
        """Export passengers to Google Sheets"""
        try:
            worksheet = self.sheet.worksheet('Passengers')
        except:
            worksheet = self.sheet.add_worksheet('Passengers', rows=1000, cols=15)
        
        worksheet.clear()
        
        headers = [
            'SR', 'Name', 'Gender', 'Age Criteria', 'Category',
            'Mobile No', 'Aadhar Received', 'Created Date'
        ]
        
        data = [headers]
        for passenger in passengers_data:
            data.append([
                passenger.get('Serial No', ''),
                passenger.get('Name', ''),
                passenger.get('Gender', ''),
                passenger.get('Age Criteria', ''),
                passenger.get('Category', ''),
                passenger.get('Mobile No', ''),
                passenger.get('Aadhar Received', ''),
                passenger.get('Created Date', '')
            ])
        
        worksheet.update('A1', data)
        return True
```

---

### **Step 4: Add Settings**

In `backend/bussewa_api/settings.py`:

```python
# Google Sheets Configuration
GOOGLE_SHEET_ID = 'your-sheet-id-here'  # From Sheet URL
```

---

### **Step 5: Create API Endpoint**

In `backend/bookings/views.py`:

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .google_sheets import GoogleSheetsService

@api_view(['POST'])
def export_to_google_sheets(request):
    """Export all data to Google Sheets"""
    try:
        # Get all data (same as CSV export)
        passengers = Passenger.objects.all()
        bookings = Booking.objects.all()
        payments = Payment.objects.all()
        
        # Prepare data (same format as CSV)
        all_data = []
        for passenger in passengers:
            booking = bookings.filter(passenger=passenger).first()
            payment = payments.filter(booking=booking).first() if booking else None
            
            calculated_price = float(booking.calculated_price) if booking else 0
            amount_received = float(payment.amount) if payment else 0
            balance = amount_received - calculated_price
            
            all_data.append({
                'SR': passenger.id,
                'Name': passenger.name,
                'Gender': passenger.gender,
                'Age Criteria': passenger.age_criteria,
                'Category': passenger.category,
                'Mobile No': passenger.mobile_no,
                'Aadhar Received': 'Yes' if passenger.aadhar_received else 'No',
                'Onwards Date': booking.onwards_date if booking else 'No Booking',
                'Return Date': booking.return_date if booking else 'No Booking',
                'Pickup Point': booking.pickup_point.name if booking and booking.pickup_point else 'Not Assigned',
                'Seat Number': booking.seat_number if booking else 'Not Assigned',
                'Calculated Price': calculated_price,
                'Amount Received': amount_received,
                'Balance': balance,
                'Payment Method': payment.payment_method if payment else 'Not Paid',
                'Collected By': payment.collected_by if payment else 'Not Paid',
                'Status': booking.status if booking else 'No Booking'
            })
        
        # Export to Google Sheets
        sheets_service = GoogleSheetsService()
        sheets_service.export_bookings(all_data)
        
        return Response({
            'success': True,
            'message': f'Exported {len(all_data)} records to Google Sheets'
        })
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)
```

In `backend/bookings/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    # ... existing urls
    path('export-to-sheets/', views.export_to_google_sheets, name='export-to-sheets'),
]
```

---

### **Step 6: Add Frontend Button**

In `frontend/src/components/ExportData.tsx`:

```typescript
const exportToGoogleSheets = async () => {
  setLoading(true);
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/bookings/export-to-sheets/');
    
    if (response.data.success) {
      alert('✅ Data exported to Google Sheets successfully!\n' + response.data.message);
    } else {
      alert('❌ Error: ' + response.data.error);
    }
  } catch (error: any) {
    alert('❌ Error exporting to Google Sheets: ' + (error.message || 'Unknown error'));
  } finally {
    setLoading(false);
  }
};

// Add button in render
<button
  onClick={exportToGoogleSheets}
  disabled={loading}
  style={{
    backgroundColor: '#0f9d58',
    color: 'white',
    border: 'none',
    padding: '15px 20px',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  }}
>
  📊 Export to Google Sheets
</button>
```

---

## 🎯 Implementation Recommendation

### **For Now (Phase 1):**
✅ **Use Manual Export (Current CSV)**
- Already working
- No setup needed
- Users upload CSV to Google Sheets
- Simple and reliable

### **Later (Phase 3 - Optional):**
⏳ **Add Auto-Sync**
- After deployment is stable
- When you have time for Google API setup
- Estimated time: 2-3 hours

---

## 💰 Cost

**Google Sheets API:**
- FREE for up to 100 requests/100 seconds
- Your usage: ~10 exports/day = FREE ✅

---

## 📋 Setup Checklist (If implementing Auto-Sync)

- [ ] Create Google Cloud Project
- [ ] Enable Google Sheets API
- [ ] Create Service Account
- [ ] Download credentials JSON
- [ ] Create Google Sheet
- [ ] Share sheet with service account
- [ ] Install Python packages
- [ ] Add google_sheets.py
- [ ] Update settings.py
- [ ] Add API endpoint
- [ ] Add frontend button
- [ ] Test export

---

## 🧪 Testing

```bash
# Test Google Sheets export
curl -X POST http://127.0.0.1:8000/api/bookings/export-to-sheets/

# Check Google Sheet
# Open your Google Sheet URL
# Verify data is there
```

---

## 🎯 Recommendation

**For your timeline:**

1. **Now:** Use CSV export (already working)
2. **After deployment:** Add Google Sheets if needed
3. **Estimated time:** 2-3 hours for full setup

**Priority:** Deploy first, add Google Sheets later if team requests it.

---

## 📝 Summary

| Feature | Status | Effort | Priority |
|---------|--------|--------|----------|
| CSV Export | ✅ Working | Done | High |
| Manual Google Sheets | ✅ Working | 0 mins | High |
| Auto Google Sheets | ⏳ Optional | 2-3 hours | Low |

**Recommendation:** Stick with CSV for now, add auto-sync later if needed.
