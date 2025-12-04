from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Volunteer
from .serializers import VolunteerSerializer

class VolunteerViewSet(viewsets.ModelViewSet):
    queryset = Volunteer.objects.filter(is_active=True)
    serializer_class = VolunteerSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing