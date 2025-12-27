from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .models import Booking, Payment, PickupPoint, Bus, SeatCancellation
from .serializers import BookingSerializer, PaymentSerializer, PickupPointSerializer, BusSerializer, SeatCancellationSerializer

class PickupPointViewSet(viewsets.ModelViewSet):
    queryset = PickupPoint.objects.all()
    serializer_class = PickupPointSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing
    
    def perform_create(self, serializer):
        # For now, save without user (we'll add auth later)
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def update_amount(self, request, pk=None):
        """Update custom booking amount"""
        booking = self.get_object()
        amount = request.data.get('amount')
        
        if amount is None:
            return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = float(amount)
            booking.update_custom_amount(amount, None)  # TODO: Add user when auth is ready
            return Response({'message': 'Amount updated successfully', 'new_amount': amount})
        except ValueError:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel_booking(self, request, pk=None):
        """Cancel entire booking with data preservation"""
        booking = self.get_object()
        reason = request.data.get('reason', 'Passenger Request')
        refund_amount = request.data.get('refund_amount', 0)
        notes = request.data.get('notes', '')
        
        try:
            cancellation = booking.cancel_booking(
                cancelled_by=None,  # TODO: Add user when auth is ready
                reason=reason,
                refund_amount=float(refund_amount),
                notes=notes
            )
            return Response({
                'message': 'Booking cancelled successfully',
                'cancellation_id': cancellation.id
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def by_volunteer(self, request):
        """Get bookings assigned to a specific volunteer"""
        volunteer_id = request.query_params.get('volunteer_id')
        if not volunteer_id:
            return Response({'error': 'volunteer_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        bookings = Booking.objects.filter(assigned_volunteer_id=volunteer_id)
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_bus(self, request):
        """Get bookings for a specific bus"""
        bus_id = request.query_params.get('bus_id')
        if not bus_id:
            return Response({'error': 'bus_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        bookings = Booking.objects.filter(assigned_bus_id=bus_id)
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing
    
    def perform_create(self, serializer):
        """Update booking payment status when payment is created"""
        payment = serializer.save()
        booking = payment.booking
        
        # Update payment status based on total payments
        total_paid = sum(p.amount for p in booking.payment_set.all())
        final_amount = booking.get_final_amount()
        
        if total_paid >= final_amount:
            booking.payment_status = 'Paid'
        elif total_paid > 0:
            booking.payment_status = 'Partial'
        else:
            booking.payment_status = 'Pending'
        
        booking.save()

class BusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing
    
    @action(detail=True, methods=['get'])
    def passenger_list(self, request, pk=None):
        """Get passenger list for a specific bus with volunteer details"""
        bus = self.get_object()
        bookings = Booking.objects.filter(assigned_bus=bus, status='Active')
        serializer = BookingSerializer(bookings, many=True)
        return Response({
            'bus': BusSerializer(bus).data,
            'passengers': serializer.data,
            'total_passengers': bookings.count()
        })

class SeatCancellationViewSet(viewsets.ModelViewSet):
    queryset = SeatCancellation.objects.all()
    serializer_class = SeatCancellationSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing
    
    @action(detail=True, methods=['post'])
    def process_refund(self, request, pk=None):
        """Mark refund as processed"""
        cancellation = self.get_object()
        refund_date = request.data.get('refund_date')
        
        cancellation.refund_processed = True
        if refund_date:
            from datetime import datetime
            cancellation.refund_date = datetime.strptime(refund_date, '%Y-%m-%d').date()
        else:
            cancellation.refund_date = timezone.now().date()
        
        cancellation.save()
        return Response({'message': 'Refund marked as processed'})