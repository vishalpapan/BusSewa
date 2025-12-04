# Aadhar Verification Strategy

## 🎯 Requirement Analysis

### Who Needs Aadhar Verification?
- **Senior Citizens (65+ Male, 75+ All)** - For age proof and concession
- **Children (12 & Below)** - For age verification
- **Anyone claiming concession** - For eligibility proof

## 📱 Implementation Options

### Option 1: File Upload (RECOMMENDED)
**Pros:**
- ✅ Works on all devices
- ✅ Better image quality
- ✅ Users can prepare documents beforehand
- ✅ Easier to implement

**Cons:**
- ❌ Requires users to have photos ready
- ❌ Extra step for users

### Option 2: Camera Capture
**Pros:**
- ✅ Real-time capture
- ✅ No pre-preparation needed

**Cons:**
- ❌ Complex implementation
- ❌ Camera permissions required
- ❌ Quality issues on some devices
- ❌ Not all devices have good cameras

### Option 3: Hybrid Approach (BEST)
- **File Upload** as primary method
- **Camera capture** as secondary option
- **Manual verification** as fallback

## 🗄️ Storage Strategy

### Option A: Local File Storage (Simple)
```
/media/aadhar_documents/
├── passenger_123_aadhar.jpg
├── passenger_124_aadhar.pdf
└── ...
```

### Option B: Cloud Storage (Scalable)
- **AWS S3** or **Google Cloud Storage**
- Better for production
- Automatic backups

### Option C: Database BLOB (Not Recommended)
- Makes database heavy
- Difficult to manage

## 🔒 Security Considerations

### Data Protection
- **Encrypt file names** (don't use real names)
- **Access control** (only authorized volunteers)
- **Automatic deletion** after event (GDPR compliance)
- **Secure file types** (JPG, PNG, PDF only)

### File Validation
- **File size limits** (max 5MB)
- **File type validation**
- **Image quality checks**
- **Virus scanning** (if possible)

## 📋 Recommended Implementation

### Phase 1: Basic File Upload
1. **Add file field** to Passenger model
2. **File upload** in passenger form
3. **Display uploaded documents** in admin
4. **Basic validation** (size, type)

### Phase 2: Enhanced Features
1. **Image preview** before upload
2. **Multiple document types** (Aadhar, PAN, etc.)
3. **Document status** (Pending, Verified, Rejected)
4. **Volunteer verification** workflow

## 🎯 Business Logic

### Verification Workflow
1. **Passenger uploads** Aadhar during registration
2. **System flags** passengers needing verification
3. **Volunteers verify** documents manually
4. **Pricing adjusts** based on verification status
5. **Reports show** verification status

### Pricing Logic Update
```python
def calculate_price(self):
    if self.requires_verification() and not self.is_verified():
        return self.get_full_price()  # No concession until verified
    else:
        return self.get_concession_price()  # Apply concession
```