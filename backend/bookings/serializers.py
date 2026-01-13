from rest_framework import serializers
from .models import Journey, JourneyPricing, Bus, Booking, Payment, SeatCancellation, PickupPoint
from passengers.models import Passenger
from authentication.serializers import UserSerializer

class JourneySerializer(serializers.ModelSerializer):
    class Meta:
        model = Journey
        fields = '__all__'

class JourneyPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JourneyPricing
        fields = '__all__'

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = '__all__'

class BusSerializer(serializers.ModelSerializer):
    journey_details = JourneySerializer(source='journey', read_only=True)
    assigned_volunteer_details = UserSerializer(source='assigned_volunteer', read_only=True)
    
    volunteer_passengers = serializers.SerializerMethodField()
    
    class Meta:
        model = Bus
        fields = '__all__'

    def get_volunteer_passengers(self, obj):
        volunteers = []
        # Check onward bookings
        for booking in obj.onward_bookings.filter(is_volunteer=True):
            volunteers.append({
                'booking_id': booking.id,
                'passenger_name': booking.passenger.name,
                'seat': booking.onward_seat_number,
                'type': 'ONWARD'
            })
        # Check return bookings
        for booking in obj.return_bookings.filter(is_volunteer=True):
            volunteers.append({
                'booking_id': booking.id,
                'passenger_name': booking.passenger.name,
                'seat': booking.return_seat_number,
                'type': 'RETURN'
            })
        return volunteers

class PickupPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickupPoint
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    passenger_details = PassengerSerializer(source='passenger', read_only=True)
    onward_journey_details = JourneySerializer(source='onward_journey', read_only=True)
    return_journey_details = JourneySerializer(source='return_journey', read_only=True)
    onward_bus_details = BusSerializer(source='onward_bus', read_only=True)
    return_bus_details = BusSerializer(source='return_bus', read_only=True)
    pickup_point_name = serializers.CharField(source='pickup_point.name', read_only=True)
    assigned_volunteer_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = '__all__'
    
    def get_assigned_volunteer_details(self, obj):
        if obj.assigned_volunteer:
            return {
                'id': obj.assigned_volunteer.id,
                'username': obj.assigned_volunteer.username,
                'email': obj.assigned_volunteer.email
            }
        return None

class PaymentSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'

class SeatCancellationSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    cancelled_by_name = serializers.CharField(source='cancelled_by.username', read_only=True)
    
    class Meta:
        model = SeatCancellation
        fields = '__all__'
