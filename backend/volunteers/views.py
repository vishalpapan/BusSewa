from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Volunteer

@api_view(['GET'])
@permission_classes([AllowAny])
def list_volunteers(request):
<<<<<<< HEAD
    # Temporary hardcoded data for testing
    data = [
        {'id': 1, 'name': 'John Doe'},
        {'id': 2, 'name': 'Jane Smith'},
        {'id': 3, 'name': 'Mike Johnson'}
    ]
=======
    volunteers = Volunteer.objects.filter(is_active=True).order_by('name')
    data = [{'id': v.id, 'name': v.name} for v in volunteers]
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    return Response(data)