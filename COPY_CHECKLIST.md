# Manual File Copy Checklist

## Backend Files to Copy

### Root Files
- [x] manage.py ✅
- [x] export_db.py ✅  
- [x] create_simple_admin.py ✅
- [x] requirements.txt ✅

### Directories to Copy (ENTIRE FOLDERS)
```
From: BusSewa/backend/
To: BusSewa-Production/backend/

□ bussewa_api/ (entire folder)
  ├── __init__.py
  ├── settings.py
  ├── urls.py
  └── wsgi.py

□ authentication/ (entire folder)
  ├── __init__.py
  ├── models.py
  ├── views.py
  └── urls.py

□ passengers/ (entire folder)
  ├── __init__.py
  ├── models.py
  ├── serializers.py
  ├── views.py
  ├── validators.py
  └── urls.py

□ bookings/ (entire folder)
  ├── __init__.py
  ├── models.py
  ├── serializers.py
  ├── views.py
  ├── views_enhanced.py
  └── urls.py
```

## Frontend Files to Copy

### Root Files
```
From: BusSewa/frontend/
To: BusSewa-Production/frontend/

□ package.json
□ package-lock.json (if exists)
```

### Directories to Copy (ENTIRE FOLDERS)
```
□ public/ (entire folder)
  ├── index.html
  ├── favicon.ico
  └── manifest.json

□ src/ (entire folder)
  ├── App.tsx
  ├── App.css
  ├── index.tsx
  ├── config/
  │   └── app.config.ts
  ├── services/
  │   └── api.ts
  └── components/ (all .tsx files)
```

## Root Documentation Files
```
From: Bus-Booking-New-Files/
To: BusSewa-Production/

□ README.md
□ ARCHITECTURE.md
□ ESSENTIAL_FILES.md
□ IMPORT_TEMPLATE.csv
```

## After Copying - Setup Steps

### 1. Frontend Setup
```bash
cd BusSewa-Production/frontend
npm install
# This will create node_modules/ automatically
```

### 2. Backend Setup  
```bash
cd BusSewa-Production/backend
pip install -r requirements.txt
python manage.py migrate
python create_simple_admin.py
```

### 3. Git Setup
```bash
cd BusSewa-Production
git init
git add .
git commit -m "Initial commit - BusSewa v2.0"
```

## Files NOT to Copy (Auto-generated)
- node_modules/ (created by npm install)
- __pycache__/ (created by Python)
- db.sqlite3 (database file)
- build/ (created by npm run build)
- .env files (create new ones)

## Total Files: ~45 files + folders
## Estimated Copy Time: 5-10 minutes