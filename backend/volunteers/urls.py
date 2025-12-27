from django.urls import path
from . import views

urlpatterns = [
    path('volunteers/', views.list_volunteers, name='list_volunteers'),
]