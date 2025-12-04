from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, PaymentViewSet, PickupPointViewSet, BusViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'pickup-points', PickupPointViewSet)
router.register(r'buses', BusViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]