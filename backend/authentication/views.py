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
                
                # Set role for superuser
                if user.is_superuser:
                    user.role = 'admin'
                    user.save()
                
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
    """List all users for dropdown purposes"""
    users = User.objects.filter(is_active=True).order_by('username')
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
            'role': user.role
        })
    
    return Response(user_data)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def create_user(request):
    """Create new user - Temporarily allow any for testing"""
    print(f"DEBUG: Creating user with data: {request.data}")
    
    # TODO: Re-enable admin check after testing
    # if not request.user.is_authenticated or request.user.role != 'admin':
    #     return Response({'error': 'Admin access required'}, status=403)
    
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

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_permissions(request, user_id):
    """Update user permissions - Admin only"""
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=403)
    
    try:
        user = User.objects.get(id=user_id)
        can_modify = request.data.get('can_modify_seat_allocation', False)
        can_cancel = request.data.get('can_cancel_seats', False)
        
        user.can_modify_seat_allocation = can_modify
        user.can_cancel_seats = can_cancel
        user.save()
        
        return Response({'message': 'Permissions updated successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
