from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Booking, Payment, PickupPoint, Bus
from .serializers import BookingSerializer, PaymentSerializer, PickupPointSerializer, BusSerializer

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

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing

class BusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing