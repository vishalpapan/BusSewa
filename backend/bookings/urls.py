from django.urls import path, include
from rest_framework.routers import DefaultRouter
<<<<<<< HEAD
from .views_enhanced import JourneyViewSet, JourneyPricingViewSet, BusViewSet as EnhancedBusViewSet, BookingViewSet as EnhancedBookingViewSet
from .views import PaymentViewSet, PickupPointViewSet, SeatCancellationViewSet

router = DefaultRouter()
router.register(r'journeys', JourneyViewSet)
router.register(r'journey-pricing', JourneyPricingViewSet)
router.register(r'buses', EnhancedBusViewSet)
router.register(r'bookings', EnhancedBookingViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'pickup-points', PickupPointViewSet)
=======
from .views import BookingViewSet, PaymentViewSet, PickupPointViewSet, BusViewSet, SeatCancellationViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'pickup-points', PickupPointViewSet)
router.register(r'buses', BusViewSet)
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
router.register(r'seat-cancellations', SeatCancellationViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]