from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Passenger
from .serializers import PassengerSerializer

class PassengerViewSet(viewsets.ModelViewSet):
    queryset = Passenger.objects.all()
    serializer_class = PassengerSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing
    
    def get_queryset(self):
        queryset = Passenger.objects.all()
        # Add search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset