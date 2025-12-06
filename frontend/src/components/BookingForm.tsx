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

const BookingForm: React.FC = () => {
  const [formData, setFormData] = useState({
    passenger: '',
    onwards_date: '',
    return_date: '',
    pickup_point: '',
    remarks: '',
  });

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  useEffect(() => {
    fetchPassengers();
    fetchPickupPoints();
  }, []);

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

  const calculatePrice = (passengerId: string) => {
    const passenger = passengers.find(p => p.id.toString() === passengerId);
    if (!passenger) return 0;

    const ageCriteria = passenger.age_criteria;
    
    if (ageCriteria.includes('M-12 & Below') || ageCriteria.includes('F-12 & Below')) {
      return 290; // Child price
    } else if (ageCriteria.includes('M-65 & Above') || ageCriteria.includes('F-Above 12 & Below 75')) {
      return 290; // Senior/Female price
    } else if (ageCriteria.includes('M&F-75 & Above')) {
      return 0; // Free for 75+
    } else {
      return 550; // Adult male price
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate price when passenger is selected
    if (name === 'passenger' && value) {
      const price = calculatePrice(value);
      setCalculatedPrice(price);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await bookingAPI.create(formData);
      alert(`Booking created successfully! Price: ₹${calculatedPrice}`);
      setFormData({
        passenger: '',
        onwards_date: '',
        return_date: '',
        pickup_point: '',
        remarks: '',
      });
      setCalculatedPrice(0);
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
            padding: '10px', 
            backgroundColor: '#e7f3ff', 
            borderRadius: '4px' 
          }}>
            <strong>Calculated Price: ₹{calculatedPrice}</strong>
            <br />
            <small>Based on age criteria: {selectedPassenger.age_criteria}</small>
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label>Onwards Date:</label>
          <input
            type="date"
            name="onwards_date"
            value={formData.onwards_date}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Return Date:</label>
          <input
            type="date"
            name="return_date"
            value={formData.return_date}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

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
          {loading ? 'Creating Booking...' : `Create Booking (₹${calculatedPrice})`}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;