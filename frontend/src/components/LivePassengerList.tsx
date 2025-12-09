import React, { useState, useEffect } from 'react';
import { passengerAPI, bookingAPI, paymentAPI } from '../services/api';

interface PassengerData {
  id: number;
  name: string;
  gender: string;
  age_criteria: string;
  category: string;
  mobile_no: string;
  aadhar_number: string;
  aadhar_received: boolean;
  verification_status: string;
  created_at: string;
  booking?: any;
  payment?: any;
  bus?: any;
}

const LivePassengerList: React.FC = () => {
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [filteredPassengers, setFilteredPassengers] = useState<PassengerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    gender: '',
    verification_status: '',
    booking_status: '',
    payment_status: '',
    seat_status: '',
    bus_number: ''
  });
  const [buses, setBuses] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [passengers, filters]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [passengersRes, bookingsRes, paymentsRes] = await Promise.all([
        passengerAPI.getAll(),
        bookingAPI.getAll(),
        paymentAPI.getAll()
      ]);

      // Fetch buses
      const busesRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/buses/`);
      const busesData = await busesRes.json();
      setBuses(busesData);
      
      const enrichedPassengers = passengersRes.data.map((passenger: any) => {
        const booking = bookingsRes.data.find((b: any) => b.passenger === passenger.id);
        const payment = paymentsRes.data.find((p: any) => p.booking === booking?.id);
        
        return {
          ...passenger,
          booking,
          payment,
          bus: booking?.bus_details || null
        };
      });

      setPassengers(enrichedPassengers);
    } catch (error) {
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePassenger = async (passengerId: number, passengerName: string, hasBooking: boolean, hasSeat: boolean) => {
    let confirmMessage = `Are you sure you want to delete passenger "${passengerName}"?`;
    
    if (hasBooking) {
      confirmMessage += '\n\n⚠️ WARNING: This passenger has booking records.';
    }
    if (hasSeat) {
      confirmMessage += '\n⚠️ WARNING: This passenger has an assigned seat.';
    }
    confirmMessage += '\n\nThis action cannot be undone and will delete all related data (bookings, payments, seat assignments).';
    
    if (!window.confirm(confirmMessage)) return;
    
    setDeleteLoading(passengerId);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/passengers/${passengerId}/`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Passenger deleted successfully!');
        fetchAllData(); // Refresh the list
      } else {
        const errorData = await response.text();
        alert('Error deleting passenger: ' + errorData);
      }
    } catch (error) {
      alert('Error deleting passenger: ' + (error as Error).message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const applyFilters = () => {
    let filtered = passengers;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.mobile_no.includes(searchLower) ||
        p.aadhar_number.includes(searchLower)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(p => p.gender === filters.gender);
    }

    // Verification status filter
    if (filters.verification_status) {
      filtered = filtered.filter(p => p.verification_status === filters.verification_status);
    }

    // Booking status filter
    if (filters.booking_status) {
      if (filters.booking_status === 'booked') {
        filtered = filtered.filter(p => p.booking);
      } else if (filters.booking_status === 'not_booked') {
        filtered = filtered.filter(p => !p.booking);
      }
    }

    // Payment status filter
    if (filters.payment_status) {
      if (filters.payment_status === 'paid') {
        filtered = filtered.filter(p => p.payment && parseFloat(p.payment.amount) > 0);
      } else if (filters.payment_status === 'unpaid') {
        filtered = filtered.filter(p => !p.payment || parseFloat(p.payment.amount) === 0);
      }
    }
    
    // Seat status filter
    if (filters.seat_status) {
      if (filters.seat_status === 'assigned') {
        filtered = filtered.filter(p => p.booking?.seat_number);
      } else if (filters.seat_status === 'unassigned') {
        filtered = filtered.filter(p => !p.booking?.seat_number);
      }
    }
    
    // Bus number filter
    if (filters.bus_number) {
      filtered = filtered.filter(p => p.bus?.bus_number === filters.bus_number);
    }

    setFilteredPassengers(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      gender: '',
      verification_status: '',
      booking_status: '',
      payment_status: '',
      seat_status: '',
      bus_number: ''
    });
  };

  const getStatusBadge = (passenger: PassengerData) => {
    if (passenger.payment && parseFloat(passenger.payment.amount) > 0) {
      return { text: 'Paid', color: '#28a745' };
    } else if (passenger.booking) {
      return { text: 'Booked', color: '#ffc107' };
    } else {
      return { text: 'Registered', color: '#6c757d' };
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📋 Live Passenger List</h2>
        <button
          onClick={fetchAllData}
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>
      
      {/* Admin Warning */}
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Admin Functions</h3>
        <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
          Delete functionality is currently available to all users. In production, this will be restricted to admin users only.
          Deleting a passenger will remove all associated bookings, payments, and seat assignments.
        </p>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Filters</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Search:</label>
            <input
              type="text"
              placeholder="Name, mobile, or Aadhar..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category:</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All Categories</option>
              <option value="Satsang">Satsang</option>
              <option value="Sewadal">Sewadal</option>
              <option value="Bal Sewadal">Bal Sewadal</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Gender:</label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All Genders</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Booking Status:</label>
            <select
              value={filters.booking_status}
              onChange={(e) => handleFilterChange('booking_status', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="booked">Booked</option>
              <option value="not_booked">Not Booked</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Payment Status:</label>
            <select
              value={filters.payment_status}
              onChange={(e) => handleFilterChange('payment_status', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Seat Status:</label>
            <select
              value={filters.seat_status}
              onChange={(e) => handleFilterChange('seat_status', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="assigned">Seat Assigned</option>
              <option value="unassigned">No Seat</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bus Number:</label>
            <select
              value={filters.bus_number}
              onChange={(e) => handleFilterChange('bus_number', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All Buses</option>
              {buses.map(bus => (
                <option key={bus.id} value={bus.bus_number}>{bus.bus_number}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button
              onClick={clearFilters}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ padding: '15px', backgroundColor: '#007bff', color: 'white', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <strong>Total:</strong> {passengers.length}
        </div>
        <div style={{ padding: '15px', backgroundColor: '#28a745', color: 'white', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <strong>Paid:</strong> {passengers.filter(p => p.payment && parseFloat(p.payment.amount) > 0).length}
        </div>
        <div style={{ padding: '15px', backgroundColor: '#ffc107', color: 'black', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <strong>Booked:</strong> {passengers.filter(p => p.booking).length}
        </div>
        <div style={{ padding: '15px', backgroundColor: '#17a2b8', color: 'white', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <strong>Filtered:</strong> {filteredPassengers.length}
        </div>
      </div>

      {/* Passenger Table */}
      <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Mobile</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Category</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Age Criteria</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Aadhar</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Seat</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Bus</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPassengers.map((passenger, index) => {
              const status = getStatusBadge(passenger);
              return (
                <tr key={passenger.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <div style={{ fontWeight: 'bold' }}>{passenger.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {passenger.gender === 'M' ? 'Male' : 'Female'}
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    {passenger.mobile_no || '-'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    {passenger.category}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontSize: '12px' }}>
                    {passenger.age_criteria}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    {passenger.aadhar_number ? (
                      <span style={{ fontFamily: 'monospace' }}>
                        {passenger.aadhar_number.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    {passenger.booking?.seat_number || '-'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    {passenger.bus?.bus_number || '-'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    {passenger.payment ? `₹${parseFloat(passenger.payment.amount).toFixed(2)}` : '-'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: status.color,
                      color: status.color === '#ffc107' ? 'black' : 'white'
                    }}>
                      {status.text}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <button
                      onClick={() => handleDeletePassenger(
                        passenger.id, 
                        passenger.name, 
                        !!passenger.booking, 
                        !!passenger.booking?.seat_number
                      )}
                      disabled={deleteLoading === passenger.id}
                      style={{
                        backgroundColor: deleteLoading === passenger.id ? '#ccc' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: deleteLoading === passenger.id ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                      title="Delete passenger (Admin only)"
                    >
                      {deleteLoading === passenger.id ? '⏳' : '🗑️'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredPassengers.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            {loading ? 'Loading passengers...' : 'No passengers found matching the filters.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePassengerList;