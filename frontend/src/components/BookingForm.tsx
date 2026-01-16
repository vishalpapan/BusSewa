import React, { useState, useEffect, useCallback } from 'react';
import { bookingAPI, passengerAPI, pickupPointAPI, busAPI } from '../services/api';

interface Passenger {
  id: number;
  name: string;
  age_criteria: string;
  mobile_no?: string; // Added for display context
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

interface Bus {
  id: number;
  bus_number: string;
  journey: number;
  capacity: number;
}

interface BookingFormProps {
  initialPassengerId?: number | null;
}

const BookingForm: React.FC<BookingFormProps> = ({ initialPassengerId }) => {
  const [formData, setFormData] = useState({
    passenger: initialPassengerId ? initialPassengerId.toString() : '',
    journey_type: 'BOTH' as 'ONWARD' | 'RETURN' | 'BOTH',
    onward_journey: '',
    return_journey: '',
    pickup_point: '',
    remarks: '',
    onward_bus: '',
    return_bus: '',
  });

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [pricing, setPricing] = useState<JourneyPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [passengerSearch, setPassengerSearch] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState({ onward: 0, return: 0, total: 0 });
  const [onwardBuses, setOnwardBuses] = useState<Bus[]>([]);
  const [returnBuses, setReturnBuses] = useState<Bus[]>([]);

  useEffect(() => {
    // fetchPassengers is handled by the search effect
    fetchPickupPoints();
    fetchJourneys();
    fetchPricing();
  }, []);

  const fetchJourneys = async () => {
    try {
      const response = await fetch('/api/journeys/', { credentials: 'include' });
      const data = await response.json();
      setJourneys(Array.isArray(data) ? data.filter((j: Journey) => j.is_active) : []);
    } catch (error) {
      console.error('Error fetching journeys:', error);
    }
  };

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/journey-pricing/', { credentials: 'include' });
      const data = await response.json();
      setPricing(Array.isArray(data) ? data.filter((p: JourneyPricing) => p.is_active) : []);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPassengers(passengerSearch);
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [passengerSearch]);

  // Fetch buses when onward journey changes
  useEffect(() => {
    if (formData.onward_journey) {
      fetchBuses(formData.onward_journey, 'ONWARD');
    } else {
      setOnwardBuses([]);
    }
  }, [formData.onward_journey]);

  // Fetch buses when return journey changes
  useEffect(() => {
    if (formData.return_journey) {
      fetchBuses(formData.return_journey, 'RETURN');
    } else {
      setReturnBuses([]);
    }
  }, [formData.return_journey]);

  const fetchBuses = async (journeyId: string, type: 'ONWARD' | 'RETURN') => {
    try {
      const response = await busAPI.getAll(); // Or use a filter endpoint if available directly by journey_id
      // Since busAPI.getAll() returns all buses, we should filter them here or use a query parameter.
      // Looking at the implementation plan, BusViewSet supports journey_id filter.
      // busAPI.getAll() in api.js just calls /api/buses/.
      // Let's manually fetch with query params or filter client side if the list is small.
      // Better: use axios directly or update api.js.
      // For now, I'll assume valid buses are returned and filter client side if needed,
      // but strictly speaking we should use the API filter.

      // Using fetch directly to support query params without modifying api.js for now,
      // or we can use the existing getAll if it doesn't take args.
      // api.js busAPI.getAll takes no args.
      // Let's use axios instance if exposed or just fetch.

      const res = await fetch(`/api/buses/?journey_id=${journeyId}`, { credentials: 'include' });
      const data = await res.json();
      if (type === 'ONWARD') {
        setOnwardBuses(data);
      } else {
        setReturnBuses(data);
      }
    } catch (error) {
      console.error(`Error fetching ${type} buses:`, error);
    }
  };


  const fetchPassengers = async (query: string = '') => {
    try {
      let response;
      if (query) {
        response = await passengerAPI.search(query);
      } else {
        // Optionally don't load all passengers initially if list is huge,
        // but for now let's keep it to show some defaults or just top 10/20 if API supported pagination
        response = await passengerAPI.getAll();
      }
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
        onward_bus: '',
        return_bus: '',
      });
      setCalculatedPrice({ onward: 0, return: 0, total: 0 });
      setPassengerSearch('');
    } catch (error: any) {
      alert('Error creating booking: ' + (error.message || 'Unknown error'));
      console.error(error);
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
          {/* Search Input for Passenger */}
          <input
            type="text"
            placeholder="Search passenger by name..."
            value={passengerSearch}
            onChange={(e) => setPassengerSearch(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', marginBottom: '5px', border: '1px solid #ced4da', borderRadius: '4px' }}
          />
          <select
            name="passenger"
            value={formData.passenger}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Choose a passenger</option>
            {passengers
              .filter(p => p.name.toLowerCase().includes(passengerSearch.toLowerCase()))
              .map((passenger) => (
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

            {/* Onward Bus Selection */}
            {formData.onward_journey && (
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '0.9em', color: '#666' }}>Assign Bus (Optional):</label>
                <select
                  name="onward_bus"
                  value={formData.onward_bus}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">Any / Unassigned</option>
                  {onwardBuses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      Bus {bus.bus_number} (Cap: {bus.capacity})
                    </option>
                  ))}
                </select>
              </div>
            )}
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

            {/* Return Bus Selection */}
            {formData.return_journey && (
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '0.9em', color: '#666' }}>Assign Bus (Optional):</label>
                <select
                  name="return_bus"
                  value={formData.return_bus}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">Any / Unassigned</option>
                  {returnBuses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      Bus {bus.bus_number} (Cap: {bus.capacity})
                    </option>
                  ))}
                </select>
              </div>
            )}
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