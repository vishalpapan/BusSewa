from rest_framework import serializers
from .models import Passenger

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'verification_status']
    
    def create(self, validated_data):
        # Handle file upload and auto-set verification status
        passenger = super().create(validated_data)
        return passenger