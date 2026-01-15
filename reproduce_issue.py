import os
import django
import sys
import json

# Setup Django environment
sys.path.append('/home/ubuntu/BusSewa/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bussewa.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from bookings.views_enhanced import BookingViewSet
from bookings.models import Booking

def check_api_pagination():
    factory = APIRequestFactory()
    view = BookingViewSet.as_view({'get': 'list'})
    request = factory.get('/bookings/')
    response = view(request)
    
    print(f"Status Code: {response.status_code}")
    
    data = response.data
    if isinstance(data, list):
        print(f"Response is a LIST. Count: {len(data)}")
        if len(data) > 0:
            print("First item:", data[0])
    elif isinstance(data, dict):
        print("Response is a DICT (Pagination likely enabled).")
        print(f"Keys: {data.keys()}")
        if 'count' in data:
            print(f"Total Count: {data['count']}")
        if 'results' in data:
            print(f"Results in this page: {len(data['results'])}")
    else:
        print(f"Unknown response type: {type(data)}")

    # Check for passenger 'komal'
    komal_bookings = Booking.objects.filter(passenger__name__icontains='komal')
    print(f"\nTotal bookings for 'komal' in DB: {komal_bookings.count()}")
    for b in komal_bookings:
        print(f" Booking ID: {b.id}, Status: {b.status}, Payment Status: {b.payment_status}")
        print(f"  Onward Journey: {b.onward_journey}, Return Journey: {b.return_journey}")
        
        payments = b.payment_set.all()
        print(f"  Payments count: {payments.count()}")
        for p in payments:
            print(f"   - Amount: {p.amount}, Date: {p.payment_date}")
            
        print(f"  Frontend 'Paid' Logic Check: {any(p.amount > 0 for p in payments)}")

if __name__ == "__main__":
    check_api_pagination()
