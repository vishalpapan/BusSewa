"""
Production settings for BusSewa
"""

from .settings import *
import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Update this with your domain/IP - ADD YOUR ACTUAL EC2 PUBLIC IP HERE
ALLOWED_HOSTS = ['44.193.198.101', 'ec2-44-193-198-101.compute-1.amazonaws.com', 'localhost', '127.0.0.1']

# CORS Settings for Production
CORS_ALLOW_ALL_ORIGINS = True  # Temporarily allow all for testing
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # For local testing
    "http://127.0.0.1:3000",
    "http://44.193.198.101",  # Your EC2 public IP
    "https://44.193.198.101",
    "http://ec2-44-193-198-101.compute-1.amazonaws.com",
    "https://ec2-44-193-198-101.compute-1.amazonaws.com",
]

# CSRF Settings
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://44.193.198.101",
    "https://44.193.198.101",
    "http://ec2-44-193-198-101.compute-1.amazonaws.com",
    "https://ec2-44-193-198-101.compute-1.amazonaws.com",
]
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = 'Lax'

# Static files (CSS, JavaScript, Images)
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/django_static/'

# Media files
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

# Database - keeping SQLite for simplicity
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'django_errors.log'),
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
