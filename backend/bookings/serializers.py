from rest_framework import serializers
<<<<<<< HEAD
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
    
    class Meta:
        model = Bus
        fields = '__all__'

=======
from .models import Booking, Payment, PickupPoint, Bus, SeatCancellation
from passengers.serializers import PassengerSerializer
from authentication.serializers import UserSerializer

>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
class PickupPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickupPoint
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    passenger_details = PassengerSerializer(source='passenger', read_only=True)
<<<<<<< HEAD
    onward_journey_details = JourneySerializer(source='onward_journey', read_only=True)
    return_journey_details = JourneySerializer(source='return_journey', read_only=True)
    onward_bus_details = BusSerializer(source='onward_bus', read_only=True)
    return_bus_details = BusSerializer(source='return_bus', read_only=True)
    pickup_point_name = serializers.CharField(source='pickup_point.name', read_only=True)
    assigned_volunteer_details = serializers.SerializerMethodField()
=======
    pickup_point_name = serializers.CharField(source='pickup_point.name', read_only=True, allow_null=True)
    bus_details = serializers.SerializerMethodField()
    assigned_volunteer_details = UserSerializer(source='assigned_volunteer', read_only=True)
    data_captured_by_details = UserSerializer(source='data_captured_by', read_only=True)
    
    def get_bus_details(self, obj):
        if obj.assigned_bus:
            return {
                'id': obj.assigned_bus.id,
                'bus_number': obj.assigned_bus.bus_number,
                'capacity': obj.assigned_bus.capacity
            }
        return None
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    
    class Meta:
        model = Booking
        fields = '__all__'
<<<<<<< HEAD
    
    def get_assigned_volunteer_details(self, obj):
        if obj.assigned_volunteer:
            return {
                'id': obj.assigned_volunteer.id,
                'username': obj.assigned_volunteer.username,
                'email': obj.assigned_volunteer.email
            }
        return None
=======
        read_only_fields = ['created_at', 'updated_at', 'data_captured_date', 'sms_sent_at', 'whatsapp_sent_at']
    
    def validate_seat_number(self, value):
        """Validate seat number format and range"""
        if not value:  # Allow empty seat numbers
            return value
            
        # Convert to string and strip whitespace
        seat_str = str(value).strip()
        if not seat_str:
            return ''
            
        # Check if it's a valid number
        try:
            seat_num = int(seat_str)
            if seat_num < 1 or seat_num > 40:
                raise serializers.ValidationError('Seat number must be between 1 and 40')
            return str(seat_num)
        except ValueError:
            raise serializers.ValidationError('Seat number must be a valid number')
    
    def validate(self, data):
        """Check for seat conflicts and bus assignment"""
        seat_number = data.get('seat_number')
        assigned_bus = data.get('assigned_bus')
        
        # If seat is being assigned, bus must also be assigned
        if seat_number and str(seat_number).strip() and not assigned_bus:
            raise serializers.ValidationError({
                'assigned_bus': 'Bus assignment is required when assigning a seat'
            })
        
        if seat_number and str(seat_number).strip():
            seat_str = str(seat_number).strip()
            # Check if seat is already taken on the same bus (excluding current booking if updating)
            existing_booking = Booking.objects.filter(
                seat_number=seat_str,
                assigned_bus=assigned_bus,
                status='Active'
            )
            
            # If updating, exclude current booking
            if self.instance:
                existing_booking = existing_booking.exclude(id=self.instance.id)
                
            if existing_booking.exists():
                raise serializers.ValidationError({
                    'seat_number': f'Seat {seat_str} is already assigned on this bus'
                })
        
        return data
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498

class PaymentSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
<<<<<<< HEAD

class SeatCancellationSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    cancelled_by_name = serializers.CharField(source='cancelled_by.username', read_only=True)
    
    class Meta:
        model = SeatCancellation
        fields = '__all__'
=======
        read_only_fields = ['created_at', 'updated_at', 'payment_date']

class BusSerializer(serializers.ModelSerializer):
    assigned_volunteer_details = UserSerializer(source='assigned_volunteer', read_only=True)
    
    class Meta:
        model = Bus
        fields = '__all__'

class SeatCancellationSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    cancelled_by_details = UserSerializer(source='cancelled_by', read_only=True)
    
    class Meta:
        model = SeatCancellation
        fields = '__all__'
        read_only_fields = ['cancellation_date']
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
