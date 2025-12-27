from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('current-user/', views.current_user, name='current_user'),
    path('register/', views.register_user, name='register'),
    path('users/', views.list_users, name='list_users'),
    path('create-user/', views.create_user, name='create_user'),
    path('users/<int:user_id>/toggle_status/', views.toggle_user_status, name='toggle_user_status'),
    path('users/<int:user_id>/update_permissions/', views.update_user_permissions, name='update_user_permissions'),
    path('api/', include(router.urls)),
]