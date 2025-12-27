import React, { useState, useEffect } from 'react';
import { bookingAPI, passengerAPI, pickupPointAPI } from '../services/api';

interface Passenger {
  id: number;
  name: string;
  age_criteria: string;
}

interface PickupPoint {
  id: number;
  name: string;
  location: string;
}

interface Journey {
  id: number;
  journey_type: 'ONWARD' | 'RETURN';
  journey_date: string;
  is_active: boolean;
}

interface JourneyPricing {
  id: number;
  journey_type: 'ONWARD' | 'RETURN';
  age_criteria: string;
  amount: number;
  is_active: boolean;
}

const BookingForm: React.FC = () => {
  const [formData, setFormData] = useState({
    passenger: '',
    journey_type: 'BOTH' as 'ONWARD' | 'RETURN' | 'BOTH',
    onward_journey: '',
    return_journey: '',
    pickup_point: '',
    remarks: '',
  });

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [pricing, setPricing] = useState<JourneyPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState({ onward: 0, return: 0, total: 0 });

  useEffect(() => {
    fetchPassengers();
    fetchPickupPoints();
    fetchJourneys();
    fetchPricing();
  }, []);

  const fetchJourneys = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/journeys/', { credentials: 'include' });
      const data = await response.json();
      setJourneys(Array.isArray(data) ? data.filter((j: Journey) => j.is_active) : []);
    } catch (error) {
      console.error('Error fetching journeys:', error);
    }
  };

  const fetchPricing = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/journey-pricing/', { credentials: 'include' });
      const data = await response.json();
      setPricing(Array.isArray(data) ? data.filter((p: JourneyPricing) => p.is_active) : []);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };

  const fetchPassengers = async () => {
    try {
      const response = await passengerAPI.getAll();
      setPassengers(response.data);
    } catch (error) {
      console.error('Error fetching passengers:', error);
    }
  };

  const fetchPickupPoints = async () => {
    try {
      const response = await pickupPointAPI.getAll();
      setPickupPoints(response.data);
    } catch (error) {
      console.error('Error fetching pickup points:', error);
    }
  };

  const calculateJourneyPrice = (journeyType: 'ONWARD' | 'RETURN', passengerId: string) => {
    const passenger = passengers.find(p => p.id.toString() === passengerId);
    if (!passenger) return 0;

    const journeyPricing = pricing.find(p => 
      p.journey_type === journeyType && 
      p.age_criteria === passenger.age_criteria
    );

    return journeyPricing ? journeyPricing.amount : 0;
  };

  const updatePricing = () => {
    if (!formData.passenger || pricing.length === 0) {
      setCalculatedPrice({ onward: 0, return: 0, total: 0 });
      return;
    }

    const onwardPrice = (formData.journey_type === 'ONWARD' || formData.journey_type === 'BOTH') 
      ? calculateJourneyPrice('ONWARD', formData.passenger) : 0;
    const returnPrice = (formData.journey_type === 'RETURN' || formData.journey_type === 'BOTH') 
      ? calculateJourneyPrice('RETURN', formData.passenger) : 0;
    
    const totalPrice = Number(onwardPrice) + Number(returnPrice);
    
    setCalculatedPrice({
      onward: Number(onwardPrice),
      return: Number(returnPrice),
      total: totalPrice
    });
  };

  useEffect(() => {
    updatePricing();
  }, [formData.passenger, formData.journey_type, passengers, pricing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await bookingAPI.create(formData);
      alert(`Booking created successfully! Total Price: ₹${calculatedPrice.total}`);
      setFormData({
        passenger: '',
        journey_type: 'BOTH',
        onward_journey: '',
        return_journey: '',
        pickup_point: '',
        remarks: '',
      });
      setCalculatedPrice({ onward: 0, return: 0, total: 0 });
    } catch (error: any) {
      alert('Error creating booking: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const selectedPassenger = passengers.find(p => p.id.toString() === formData.passenger);

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h2>Create New Booking</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Select Passenger:</label>
          <select
            name="passenger"
            value={formData.passenger}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Choose a passenger</option>
            {passengers.map((passenger) => (
              <option key={passenger.id} value={passenger.id}>
                {passenger.name} - {passenger.age_criteria}
              </option>
            ))}
          </select>
        </div>

        {selectedPassenger && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '15px', 
            backgroundColor: '#e7f3ff', 
            borderRadius: '4px' 
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Pricing Breakdown</h4>
            {(formData.journey_type === 'ONWARD' || formData.journey_type === 'BOTH') && (
              <div>Onward Journey: Rs.{(calculatedPrice.onward || 0).toFixed(2)}</div>
            )}
            {(formData.journey_type === 'RETURN' || formData.journey_type === 'BOTH') && (
              <div>Return Journey: Rs.{(calculatedPrice.return || 0).toFixed(2)}</div>
            )}
            <div style={{ fontWeight: 'bold', marginTop: '5px', fontSize: '16px' }}>
              Total Price: Rs.{(calculatedPrice.total || 0).toFixed(2)}
            </div>
            <small>Based on age criteria: {selectedPassenger.age_criteria}</small>
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label>Journey Selection:</label>
          <select
            name="journey_type"
            value={formData.journey_type}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="ONWARD">Onward Journey Only</option>
            <option value="RETURN">Return Journey Only</option>
            <option value="BOTH">Both Journeys</option>
          </select>
        </div>

        {(formData.journey_type === 'ONWARD' || formData.journey_type === 'BOTH') && (
          <div style={{ marginBottom: '15px' }}>
            <label>Select Onward Journey:</label>
            <select
              name="onward_journey"
              value={formData.onward_journey}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Choose onward journey date</option>
              {journeys.filter(j => j.journey_type === 'ONWARD').map((journey) => (
                <option key={journey.id} value={journey.id}>
                  {new Date(journey.journey_date).toLocaleDateString('en-IN')} - Onward
                </option>
              ))}
            </select>
          </div>
        )}

        {(formData.journey_type === 'RETURN' || formData.journey_type === 'BOTH') && (
          <div style={{ marginBottom: '15px' }}>
            <label>Select Return Journey:</label>
            <select
              name="return_journey"
              value={formData.return_journey}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Choose return journey date</option>
              {journeys.filter(j => j.journey_type === 'RETURN').map((journey) => (
                <option key={journey.id} value={journey.id}>
                  {new Date(journey.journey_date).toLocaleDateString('en-IN')} - Return
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label>Pickup Point:</label>
          <select
            name="pickup_point"
            value={formData.pickup_point}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select pickup point</option>
            {pickupPoints.map((point) => (
              <option key={point.id} value={point.id}>
                {point.name} - {point.location}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Remarks:</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows={3}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="Any special notes or requirements..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating Booking...' : `Create Booking (Rs.${(calculatedPrice.total || 0).toFixed(2)})`}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;