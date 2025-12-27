from rest_framework import serializers
from .models import Journey, JourneyPricing, Bus, Booking, Payment, SeatCancellation, PickupPoint
from passengers.models import Passenger

class JourneySerializer(serializers.ModelSerializer):
    class Meta:
        model = Journey
        fields = '__all__'

class JourneyPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JourneyPricing
        fields = '__all__'

class BusSerializer(serializers.ModelSerializer):
    journey_details = JourneySerializer(source='journey', read_only=True)
    
    class Meta:
        model = Bus
        fields = '__all__'

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
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

class PickupPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickupPoint
        fields = '__all__'