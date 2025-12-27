from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Volunteer

@api_view(['GET'])
@permission_classes([AllowAny])
def list_volunteers(request):
    # Temporary hardcoded data for testing
    data = [
        {'id': 1, 'name': 'John Doe'},
        {'id': 2, 'name': 'Jane Smith'},
        {'id': 3, 'name': 'Mike Johnson'}
    ]
    return Response(data)
