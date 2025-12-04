from rest_framework import serializers
from .models import Booking, Payment, PickupPoint, Bus
from passengers.serializers import PassengerSerializer

class PickupPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickupPoint
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    passenger_details = PassengerSerializer(source='passenger', read_only=True)
    pickup_point_name = serializers.CharField(source='pickup_point.name', read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'data_captured_date']

class PaymentSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['created_at']

class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = '__all__'