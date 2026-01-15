# Changelog

## Version 3.1 - Security Update (January 2026)

### 🔒 Security & Management
- ✅ **Delete Booking Feature**: Admins can now permanently delete bookings.
- ✅ **Role-Based Access Control**: Strict enforcement of Admin vs Volunteer permissions.
- ✅ **Secure API**: All booking endpoints now require authentication.
- ✅ **HTTPS Guide**: Added documentation for SSL setup with custom domains.

---

## Version 2.0 - Latest Update (December 2025)

### 🎉 New Features

#### Authentication System
- ✅ Custom User model with role-based access (Admin, Volunteer, Viewer)
- ✅ Session-based authentication with persistence
- ✅ Login/logout functionality
- ✅ User management via Django Admin
- ✅ Role-based permissions for all features

#### Aadhar Number Integration
- ✅ 12-digit Aadhar number field for passengers
- ✅ Client and server-side validation
- ✅ Included in all data exports
- ✅ Required field for passenger registration

#### 40-Seat Bus Configuration
- ✅ Updated from 42 to 40 seats
- ✅ Visual seat allocation interface (10 rows × 4 seats)
- ✅ Smart seat assignment with senior priority
- ✅ Bus selection mandatory for seat allocation

#### Enhanced Data Export
- ✅ UTF-8 BOM encoding for Excel compatibility
- ✅ Indian date format (DD/MM/YYYY)
- ✅ Currency symbols (₹) with proper formatting
- ✅ Proper CSV escaping for special characters
- ✅ Serial numbers in all exports

#### Data Import System
- ✅ CSV import with template download
- ✅ Field validation before import
- ✅ Error reporting for invalid data
- ✅ Bulk passenger creation

#### Family Grouping
- ✅ Link related passengers
- ✅ Automatic adjacent seat assignment
- ✅ Relationship tracking (Parent, Spouse, Child, Sibling)

#### Live Passenger List
- ✅ Real-time passenger view
- ✅ Advanced filtering (status, bus, seat assignment)
- ✅ Quick actions (edit, delete, allocate seat)
- ✅ Search functionality

#### Multi-Bus Management
- ✅ Support for multiple buses
- ✅ Bus-specific seat allocation
- ✅ Bus number tracking
- ✅ Admin-controlled bus creation

### 🔧 Technical Improvements

#### Backend
- Custom User model extending AbstractUser
- UserProfile model for additional user data
- Session configuration for 24-hour persistence
- CORS configuration for frontend communication
- CSRF protection with proper exemptions
- Updated all ForeignKey references to custom User model

#### Frontend
- Authentication state management with localStorage
- Session persistence across page refresh
- Improved error handling and user feedback
- Removed in-app user registration (admin-only)
- Better form validation and UX

### 📝 Files Modified

#### Backend Files
- `authentication/models.py` - Custom User and UserProfile models
- `authentication/views.py` - Login, logout, and auth endpoints
- `authentication/serializers.py` - User serializers
- `authentication/admin.py` - Django admin configuration
- `authentication/urls.py` - Authentication URL patterns
- `authentication/migrations/0001_initial.py` - Initial migration with custom User
- `passengers/models.py` - Added aadhar_number field and family relationships
- `passengers/validators.py` - Aadhar number validation
- `bookings/models.py` - 40-seat capacity and custom User reference
- `bussewa_api/settings.py` - Session, CORS, and AUTH_USER_MODEL config
- `bussewa_api/urls.py` - Added /auth/ prefix for authentication

#### Frontend Files
- `App.tsx` - Authentication state and session management
- `components/Login.tsx` - Simplified login (no registration)
- `components/PassengerForm.tsx` - Aadhar number field
- `components/SeatAllocation.tsx` - 40-seat layout
- `components/ExportData.tsx` - Enhanced CSV export
- `components/LivePassengerList.tsx` - Real-time passenger list
- `components/ImportData.tsx` - CSV import functionality

### 🐛 Bug Fixes
- Fixed session logout on page refresh
- Fixed CSRF token issues with authentication
- Fixed seat allocation validation
- Fixed CSV export encoding for Excel
- Fixed user role assignment for superusers

### 🔒 Security Updates
- Role-based access control implemented
- Session security improved
- CSRF protection properly configured
- Password hashing with Django's built-in system
- Input validation for all user inputs

### 📚 Documentation
- Comprehensive README with setup instructions
- Windows and Linux setup guides
- API endpoint documentation
- Troubleshooting guide
- User roles and permissions table

---

## Version 1.0 - Initial Release

### Features
- Passenger management
- Booking system
- Payment tracking
- Dashboard with statistics
- Basic data export
- Document upload for Aadhar verification

---

**For detailed setup instructions, see [README.md](README.md)**
