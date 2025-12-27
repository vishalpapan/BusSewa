#!/usr/bin/env python
"""
Create additional superuser for BusSewa
Usage: python create_additional_admin.py
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bussewa_api.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_additional_admin():
    print("🔐 Creating Additional Admin User for BusSewa")
    print("=" * 50)
    
    username = input("Enter username: ").strip()
    if not username:
        print("❌ Username cannot be empty")
        return
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        print(f"❌ User '{username}' already exists")
        return
    
    password = input("Enter password: ").strip()
    if not password:
        print("❌ Password cannot be empty")
        return
    
    email = input("Enter email (optional): ").strip()
    
    try:
        # Create superuser
        user = User.objects.create_superuser(
            username=username,
            password=password,
            email=email if email else f"{username}@bussewa.local"
        )
        
        print(f"✅ Superuser '{username}' created successfully!")
        print(f"📧 Email: {user.email}")
        print(f"🔑 Password: {password}")
        print("\n🚀 You can now login with these credentials")
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")

if __name__ == "__main__":
    create_additional_admin()