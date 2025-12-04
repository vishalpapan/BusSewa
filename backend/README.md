# BusSewa Backend - Django REST API

## Setup Instructions

1. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create Django project:**
   ```bash
   django-admin startproject bussewa_api .
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run development server:**
   ```bash
   python manage.py runserver
   ```

## Project Structure
- `bussewa_api/` - Main Django project
- `apps/` - Django applications (to be created)
- `requirements.txt` - Python dependencies

## Next Steps
- Configure Django settings
- Create authentication app
- Set up API endpoints