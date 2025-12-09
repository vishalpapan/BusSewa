from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import User, UserProfile
from .serializers import UserSerializer, UserProfileSerializer
import json

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return JsonResponse({'error': 'Username and password required'}, status=400)
            
            user = authenticate(request, username=username, password=password)
            if user and user.is_active:
                login(request, user)
                
                # Get or create profile
                profile, created = UserProfile.objects.get_or_create(
                    user=user,
                    defaults={'full_name': user.get_full_name() or user.username}
                )
                
                return JsonResponse({
                    'success': True,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'role': user.role,
                        'full_name': profile.full_name,
                        'is_staff': user.is_staff
                    }
                })
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
                
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(View):
    def post(self, request):
        logout(request)
        return JsonResponse({'success': True})

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={'full_name': user.get_full_name() or user.username}
    )
    
    return Response({
        'id': user.id,
        'username': user.username,
        'role': user.role,
        'full_name': profile.full_name,
        'is_staff': user.is_staff,
        'permissions': {
            'can_delete': user.role == 'admin',
            'can_manage_buses': user.role in ['admin', 'volunteer'],
            'can_export': user.role in ['admin', 'volunteer'],
            'can_import': user.role in ['admin', 'volunteer'],
        }
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register new user - for demo purposes, will be admin-only in production"""
    try:
        data = request.data
        
        # Check if user already exists
        if User.objects.filter(username=data.get('username')).exists():
            return Response({'error': 'Username already exists'}, status=400)
        
        # Create user
        user = User.objects.create_user(
            username=data.get('username'),
            password=data.get('password'),
            email=data.get('email', '')
        )
        user.role = data.get('role', 'volunteer')
        user.save()
        
        # Create profile
        UserProfile.objects.create(
            user=user,
            full_name=data.get('full_name', user.username),
            department=data.get('department', '')
        )
        
        return Response({
            'success': True,
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """List all users - Admin only"""
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=403)
    
    users = User.objects.all().order_by('-date_joined')
    user_data = []
    
    for user in users:
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={'full_name': user.get_full_name() or user.username}
        )
        
        user_data.append({
            'id': user.id,
            'username': user.username,
            'full_name': profile.full_name,
            'role': user.role,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'department': profile.department
        })
    
    return Response(user_data)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def create_user(request):
    """Create new user - Admin only"""
    print(f"DEBUG: User: {request.user}, Authenticated: {request.user.is_authenticated}, Role: {getattr(request.user, 'role', 'NO_ROLE')}")
    
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    if not hasattr(request.user, 'role') or request.user.role != 'admin':
        return Response({'error': f'Admin access required. Current role: {getattr(request.user, "role", "unknown")}'}, status=403)
    
    try:
        data = request.data
        
        # Validate required fields
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        full_name = data.get('full_name', '').strip()
        
        if not username:
            return Response({'error': 'Username is required'}, status=400)
        if not password:
            return Response({'error': 'Password is required'}, status=400)
        if not full_name:
            return Response({'error': 'Full name is required'}, status=400)
        if len(password) < 6:
            return Response({'error': 'Password must be at least 6 characters'}, status=400)
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)
        
        # Create user
        user = User.objects.create_user(
            username=username,
            password=password
        )
        user.role = data.get('role', 'volunteer')
        user.save()
        
        # Create profile
        UserProfile.objects.create(
            user=user,
            full_name=full_name,
            department=data.get('department', '').strip()
        )
        
        return Response({
            'success': True,
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_user_status(request, user_id):
    """Activate/Deactivate user - Admin only"""
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=403)
    
    try:
        user = User.objects.get(id=user_id)
        user.is_active = not user.is_active
        user.save()
        
        return Response({
            'success': True,
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully'
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)