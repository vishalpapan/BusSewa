from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db import models
from .models import Journey, JourneyPricing, Bus, Booking
from .serializers import JourneySerializer, JourneyPricingSerializer, BusSerializer, BookingSerializer

class JourneyViewSet(viewsets.ModelViewSet):
    queryset = Journey.objects.all()
    serializer_class = JourneySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Journey.objects.all()
        journey_type = self.request.query_params.get('journey_type', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if journey_type:
            queryset = queryset.filter(journey_type=journey_type)
        if is_active:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        return queryset.order_by('journey_date', 'journey_type')

class JourneyPricingViewSet(viewsets.ModelViewSet):
    queryset = JourneyPricing.objects.all()
    serializer_class = JourneyPricingSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = JourneyPricing.objects.all()
        journey_type = self.request.query_params.get('journey_type', None)
        
        if journey_type:
            queryset = queryset.filter(journey_type=journey_type)
            
        return queryset.filter(is_active=True).order_by('journey_type', 'age_criteria')

class BusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Bus.objects.all()
        journey_id = self.request.query_params.get('journey_id', None)
        journey_type = self.request.query_params.get('journey_type', None)
        journey_date = self.request.query_params.get('journey_date', None)
        
        if journey_id:
            queryset = queryset.filter(journey_id=journey_id)
        if journey_type:
            queryset = queryset.filter(journey__journey_type=journey_type)
        if journey_date:
            queryset = queryset.filter(journey__journey_date=journey_date)
            
        return queryset.order_by('journey__journey_date', 'bus_number')
    
    @action(detail=True, methods=['get'])
    def passenger_list(self, request, pk=None):
        """Get passenger list for a specific bus"""
        bus = get_object_or_404(Bus, pk=pk)
        
        # Get bookings for this bus (both onward and return)
        onward_bookings = Booking.objects.filter(
            onward_bus=bus,
            status='Active'
        ).select_related('passenger', 'assigned_volunteer')
        
        return_bookings = Booking.objects.filter(
            return_bus=bus,
            status='Active'
        ).select_related('passenger', 'assigned_volunteer')
        
        # Combine and format passenger data
        passengers = []
        
        for booking in onward_bookings:
            passengers.append({
                'id': booking.id,
                'passenger_details': {
                    'name': booking.passenger.name,
                    'mobile_no': booking.passenger.mobile_no,
                    'age': booking.passenger.age,
                    'age_criteria': booking.passenger.age_criteria
                },
                'seat_number': booking.onward_seat_number,
                'journey_type': 'ONWARD',
                'calculated_price': float(booking.onward_price),
                'custom_amount': float(booking.custom_amount) if booking.custom_amount else None,
                'payment_status': booking.payment_status,
                'assigned_volunteer_details': {
                    'username': booking.assigned_volunteer.username if booking.assigned_volunteer else ''
                }
            })
        
        for booking in return_bookings:
            passengers.append({
                'id': booking.id,
                'passenger_details': {
                    'name': booking.passenger.name,
                    'mobile_no': booking.passenger.mobile_no,
                    'age': booking.passenger.age,
                    'age_criteria': booking.passenger.age_criteria
                },
                'seat_number': booking.return_seat_number,
                'journey_type': 'RETURN',
                'calculated_price': float(booking.return_price),
                'custom_amount': float(booking.custom_amount) if booking.custom_amount else None,
                'payment_status': booking.payment_status,
                'assigned_volunteer_details': {
                    'username': booking.assigned_volunteer.username if booking.assigned_volunteer else ''
                }
            })
        
        return Response({
            'bus': {
                'id': bus.id,
                'bus_number': bus.bus_number,
                'journey': str(bus.journey),
                'capacity': bus.capacity
            },
            'passengers': passengers
        })
    
    @action(detail=True, methods=['get'])
    def seat_allocation(self, request, pk=None):
        """Get seat allocation status for a specific bus"""
        bus = get_object_or_404(Bus, pk=pk)
        
        # Get all occupied seats
        occupied_seats = {}
        
        # Onward journey seats
        onward_bookings = Booking.objects.filter(
            onward_bus=bus,
            status='Active',
            onward_seat_number__isnull=False
        ).exclude(onward_seat_number='').select_related('passenger')
        
        for booking in onward_bookings:
            seat_num = booking.onward_seat_number
            occupied_seats[seat_num] = {
                'passenger_name': booking.passenger.name,
                'passenger_age': booking.passenger.age,
                'journey_type': 'ONWARD',
                'booking_id': booking.id
            }
        
        # Return journey seats (if same bus used for return)
        return_bookings = Booking.objects.filter(
            return_bus=bus,
            status='Active',
            return_seat_number__isnull=False
        ).exclude(return_seat_number='').select_related('passenger')
        
        for booking in return_bookings:
            seat_num = booking.return_seat_number
            if seat_num in occupied_seats:
                # Seat occupied by both journeys
                occupied_seats[seat_num]['journey_type'] = 'BOTH'
            else:
                occupied_seats[seat_num] = {
                    'passenger_name': booking.passenger.name,
                    'passenger_age': booking.passenger.age,
                    'journey_type': 'RETURN',
                    'booking_id': booking.id
                }
        
        return Response({
            'bus_id': bus.id,
            'bus_number': bus.bus_number,
            'journey': str(bus.journey),
            'capacity': bus.capacity,
            'occupied_seats': occupied_seats,
            'available_seats': bus.capacity - len(occupied_seats)
        })

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Booking.objects.all()
        journey_type = self.request.query_params.get('journey_type', None)
        journey_date = self.request.query_params.get('journey_date', None)
        status_filter = self.request.query_params.get('status', None)
        
        if journey_type:
            if journey_type == 'ONWARD':
                queryset = queryset.filter(onward_journey__isnull=False)
            elif journey_type == 'RETURN':
                queryset = queryset.filter(return_journey__isnull=False)
        
        if journey_date:
            queryset = queryset.filter(
                models.Q(onward_journey__journey_date=journey_date) |
                models.Q(return_journey__journey_date=journey_date)
            )
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def by_volunteer(self, request):
        """Get bookings assigned to a specific volunteer"""
        volunteer_id = request.query_params.get('volunteer_id')
        if not volunteer_id:
            return Response({'error': 'volunteer_id parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        bookings = Booking.objects.filter(
            assigned_volunteer_id=volunteer_id,
            status='Active'
        ).select_related('passenger', 'onward_journey', 'return_journey', 'onward_bus', 'return_bus')
        
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel_booking(self, request, pk=None):
        """Cancel a booking (safe cancellation)"""
        booking = get_object_or_404(Booking, pk=pk)
        
        journey_type = request.data.get('journey_type', 'BOTH')  # ONWARD, RETURN, or BOTH
        reason = request.data.get('reason', 'Passenger Request')
        notes = request.data.get('notes', '')
        
        # Create cancellation record
        from .models import SeatCancellation
        cancellation = SeatCancellation.objects.create(
            booking=booking,
            cancelled_by=request.user,
            journey_type=journey_type,
            reason=reason,
            notes=notes,
            original_onward_seat=booking.onward_seat_number,
            original_return_seat=booking.return_seat_number,
            original_amount_paid=sum(p.amount for p in booking.payment_set.all())
        )
        
        # Update booking based on cancellation type
        if journey_type == 'ONWARD':
            booking.onward_journey = None
            booking.onward_bus = None
            booking.onward_seat_number = ''
            booking.onward_price = 0
        elif journey_type == 'RETURN':
            booking.return_journey = None
            booking.return_bus = None
            booking.return_seat_number = ''
            booking.return_price = 0
        else:  # BOTH
            booking.status = 'Cancelled'
            booking.onward_journey = None
            booking.return_journey = None
            booking.onward_bus = None
            booking.return_bus = None
            booking.onward_seat_number = ''
            booking.return_seat_number = ''
        
        booking.save()
        
        return Response({
            'message': f'{journey_type} journey cancelled successfully',
            'cancellation_id': cancellation.id
        })