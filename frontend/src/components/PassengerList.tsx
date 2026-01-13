import React, { useState, useEffect } from 'react';
import { passengerAPI, bookingAPI, pickupPointAPI } from '../services/api';

interface Passenger {
  id: number;
  name: string;
  gender: string;
  age_criteria: string;
  category: string;
  mobile_no: string;
  aadhar_received: boolean;
  created_at: string;
}

interface PickupPoint {
  id: number;
  name: string;
  location: string;
}

interface Booking {
  id: number;
  passenger: number;
  onwards_date: string;
  return_date: string;
  calculated_price: number;
  status: string;
}

interface PassengerListProps {
  onNavigate?: (tab: string, passengerId?: number) => void;
}

const PassengerList: React.FC<PassengerListProps> = ({ onNavigate }) => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  const fetchPassengers = async () => {
    try {
      const response = await passengerAPI.getAll();
      setPassengers(response.data);
    } catch (error) {
      console.error('Error fetching passengers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  useEffect(() => {
    fetchPassengers();
    fetchBookings();
    fetchPickupPoints();
  }, []);

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const response = await passengerAPI.search(searchTerm);
        setPassengers(response.data);
      } catch (error) {
        console.error('Error searching passengers:', error);
      }
    } else {
      fetchPassengers();
    }
  };

  const calculatePrice = (ageCriteria: string) => {
    if (ageCriteria.includes('M-12 & Below') || ageCriteria.includes('F-12 & Below')) {
      return 290;
    } else if (ageCriteria.includes('M-65 & Above') || ageCriteria.includes('F-Above 12 & Below 75')) {
      return 290;
    } else if (ageCriteria.includes('M&F-75 & Above')) {
      return 0;
    } else {
      return 550;
    }
  };

  const getPassengerBookingStatus = (passengerId: number) => {
    const passengerBookings = bookings.filter(b => b.passenger === passengerId && b.status === 'Active');
    return passengerBookings.length > 0 ? passengerBookings[0] : null;
  };

  const openBookingModal = (passenger: Passenger) => {
    if (onNavigate) {
      onNavigate('booking', passenger.id);
    }
  };



  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading passengers...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <h2>Passenger List ({passengers.length})</h2>

      {/* Search */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
        >
          Search
        </button>
        <button
          onClick={fetchPassengers}
          style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none' }}
        >
          Show All
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Gender</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Age Criteria</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Mobile</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Aadhar</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Booking Status</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Added On</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((passenger) => {
              const booking = getPassengerBookingStatus(passenger.id);
              const price = calculatePrice(passenger.age_criteria);

              return (
                <tr key={passenger.id}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{passenger.name}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{passenger.gender}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{passenger.age_criteria}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{passenger.category}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{passenger.mobile_no}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {passenger.aadhar_received ? '✅' : '❌'}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {booking ? (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        fontSize: '12px'
                      }}>
                        Booked (₹{booking.calculated_price})
                      </span>
                    ) : (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        fontSize: '12px'
                      }}>
                        No Booking
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => onNavigate && onNavigate('add', passenger.id)}
                        style={{
                          backgroundColor: '#ffc107',
                          color: '#212529',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Edit
                      </button>
                      {!booking ? (
                        <button
                          onClick={() => openBookingModal(passenger)}
                          style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Booking (₹{price})
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#666', alignSelf: 'center' }}>Booked</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {new Date(passenger.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {passengers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No passengers found. Add some passengers first!
        </div>
      )}


    </div>
  );
};

export default PassengerList;