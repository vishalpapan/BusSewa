import React, { useState, useEffect } from 'react';
import { bookingAPI, paymentAPI, volunteerAPI } from '../services/api';

interface Booking {
  id: number;
  passenger_details: {
    name: string;
    mobile_no: string;
    age_criteria: string;
  };
  onwards_date: string;
  return_date: string;
  pickup_point_name: string;
  calculated_price: number;
  status: string;
  remarks: string;
  created_at: string;
}

interface Volunteer {
  id: number;
  name: string;
}

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<{ show: boolean; booking: Booking | null }>({
    show: false,
    booking: null
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'Cash',
    collected_by: '',
  });

  useEffect(() => {
    fetchBookings();
    fetchVolunteers();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await volunteerAPI.getAll();
      setVolunteers(response.data);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    }
  };

  const openPaymentModal = (booking: Booking) => {
    setPaymentModal({ show: true, booking });
    setPaymentData({
      amount: booking.calculated_price.toString(),
      payment_method: 'Cash',
      collected_by: '',
    });
  };

  const closePaymentModal = () => {
    setPaymentModal({ show: false, booking: null });
    setPaymentData({ amount: '', payment_method: 'Cash', collected_by: '' });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal.booking) return;

    try {
      await paymentAPI.create({
        booking: paymentModal.booking.id,
        ...paymentData,
      });
      alert('Payment recorded successfully!');
      closePaymentModal();
      fetchBookings(); // Refresh list
    } catch (error: any) {
      alert('Error recording payment: ' + (error.message || 'Unknown error'));
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading bookings...</div>;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '20px' }}>
      <h2>Booking List ({bookings.length})</h2>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Passenger</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Mobile</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Journey</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Pickup Point</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Price</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <strong>{booking.passenger_details.name}</strong>
                  <br />
                  <small>{booking.passenger_details.age_criteria}</small>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {booking.passenger_details.mobile_no}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <strong>Onwards:</strong> {booking.onwards_date || 'Not set'}
                  <br />
                  <strong>Return:</strong> {booking.return_date || 'Not set'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {booking.pickup_point_name || 'Not assigned'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <strong>₹{booking.calculated_price}</strong>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    backgroundColor: booking.status === 'Active' ? '#d4edda' : '#f8d7da',
                    color: booking.status === 'Active' ? '#155724' : '#721c24'
                  }}>
                    {booking.status}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => openPaymentModal(booking)}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Record Payment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No bookings found. Create some bookings first!
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3>Record Payment</h3>
            <p><strong>Passenger:</strong> {paymentModal.booking?.passenger_details.name}</p>
            <p><strong>Calculated Price:</strong> ₹{paymentModal.booking?.calculated_price}</p>
            
            <form onSubmit={handlePaymentSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label>Amount Received:</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Payment Method:</label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="Cash">Cash</option>
                  <option value="GPay">GPay</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Collected By (Volunteer):</label>
                <select
                  value={paymentData.collected_by}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, collected_by: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">Select volunteer</option>
                  {volunteers.map((volunteer) => (
                    <option key={volunteer.id} value={volunteer.name}>
                      {volunteer.name}
                    </option>
                  ))}
                  <option value="Other">Other (Manual Entry)</option>
                </select>
                {paymentData.collected_by === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter volunteer name"
                    onChange={(e) => setPaymentData(prev => ({ ...prev, collected_by: e.target.value }))}
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closePaymentModal}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;