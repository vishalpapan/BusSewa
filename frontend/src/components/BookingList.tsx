import React, { useState, useEffect } from 'react';
import { bookingAPI, paymentAPI, volunteerAPI } from '../services/api';

interface Booking {
  id: number;
  passenger_details: {
    name: string;
    mobile_no: string;
    age_criteria: string;
  };
  journey_type: string;
  onward_journey_details?: {
    journey_date: string;
    journey_type: string;
  };
  return_journey_details?: {
    journey_date: string;
    journey_type: string;
  };
  pickup_point_name: string;
  onward_price: number;
  return_price: number;
  total_price: number;
  custom_amount?: number;
  payment_status: string;
  status: string;
  remarks: string;
  created_at: string;
  assigned_volunteer_details?: {
    id: number;
    username: string;
    profile: { full_name: string };
  };
  onward_seat_number: string;
  return_seat_number: string;
  onward_bus_details?: {
    id: number;
    bus_number: string;
  };
  return_bus_details?: {
    id: number;
    bus_number: string;
  };
}



interface Volunteer {
  id: number;
  username: string;
  full_name: string;
  role: string;
}

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<{ show: boolean; booking: Booking | null }>({
    show: false,
    booking: null
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'Cash',
    collected_by: '',
    payment_received_date: new Date().toISOString().split('T')[0],
  });
  const [editingAmount, setEditingAmount] = useState<{ bookingId: number; amount: string } | null>(null);
  const [cancelModal, setCancelModal] = useState<{ show: boolean; booking: Booking | null }>({
    show: false,
    booking: null
  });
  const [cancelData, setCancelData] = useState({
    reason: 'Passenger Request',
    refund_amount: '0',
    notes: ''
  });

  useEffect(() => {
    fetchBookings();

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





  const openPaymentModal = (booking: Booking) => {
    setPaymentModal({ show: true, booking });
    const finalAmount = booking.custom_amount || booking.total_price || 0;
    setPaymentData({
      amount: finalAmount.toString(),
      payment_method: 'Cash',
      collected_by: '',
      payment_received_date: new Date().toISOString().split('T')[0],
    });
  };
  
  const updateBookingAmount = async (bookingId: number, newAmount: string) => {
    try {
      await fetch(`/api/bookings/${bookingId}/update_amount/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(newAmount) })
      });
      setEditingAmount(null);
      fetchBookings();
    } catch (error) {
      alert('Error updating amount');
    }
  };
  
  const openCancelModal = (booking: Booking) => {
    setCancelModal({ show: true, booking });
    setCancelData({
      reason: 'Passenger Request',
      refund_amount: '0',
      notes: ''
    });
  };
  
  const handleBookingCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModal.booking) return;
    
    try {
      await fetch(`/api/bookings/${cancelModal.booking.id}/cancel_booking/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelData)
      });
      alert('Booking cancelled successfully!');
      setCancelModal({ show: false, booking: null });
      fetchBookings();
    } catch (error) {
      alert('Error cancelling booking');
    }
  };

  const closePaymentModal = () => {
    setPaymentModal({ show: false, booking: null });
    setPaymentData({ amount: '', payment_method: 'Cash', collected_by: '', payment_received_date: new Date().toISOString().split('T')[0] });
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
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Volunteer</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Seat/Bus</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Amount</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Payment</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const finalAmount = booking.custom_amount || booking.total_price || 0;
              return (
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
                  {booking.assigned_volunteer_details ? 
                    booking.assigned_volunteer_details.profile.full_name : 
                    <span style={{ color: '#999' }}>Not assigned</span>
                  }
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {booking.onward_seat_number || booking.return_seat_number ? (
                    <div>
                      {booking.onward_seat_number && (
                        <div><strong>Onward:</strong> {booking.onward_seat_number} ({booking.onward_bus_details?.bus_number || 'TBD'})</div>
                      )}
                      {booking.return_seat_number && (
                        <div><strong>Return:</strong> {booking.return_seat_number} ({booking.return_bus_details?.bus_number || 'TBD'})</div>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: '#999' }}>No seats assigned</span>
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {editingAmount?.bookingId === booking.id ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input
                        type="number"
                        value={editingAmount.amount}
                        onChange={(e) => setEditingAmount({ bookingId: booking.id, amount: e.target.value })}
                        style={{ width: '80px', padding: '2px' }}
                      />
                      <button
                        onClick={() => updateBookingAmount(booking.id, editingAmount.amount)}
                        style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '2px' }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingAmount(null)}
                        style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '2px' }}
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <div>
                      <strong 
                        onClick={() => setEditingAmount({ bookingId: booking.id, amount: finalAmount.toString() })}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        title="Click to edit"
                      >
                        ₹{finalAmount}
                      </strong>
                      {booking.custom_amount && (
                        <div style={{ fontSize: '10px', color: '#666' }}>Custom amount</div>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: 
                      booking.payment_status === 'Paid' ? '#d4edda' : 
                      booking.payment_status === 'Partial' ? '#fff3cd' : '#f8d7da',
                    color: 
                      booking.payment_status === 'Paid' ? '#155724' : 
                      booking.payment_status === 'Partial' ? '#856404' : '#721c24'
                  }}>
                    {booking.payment_status}
                  </span>
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
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => openPaymentModal(booking)}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      💰 Payment
                    </button>
                    {booking.status === 'Active' && (
                      <button
                        onClick={() => openCancelModal(booking)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        🚫 Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
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
            <p><strong>Total Price:</strong> ₹{paymentModal.booking?.total_price || 0}</p>
            
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
                <label>Payment Received Date:</label>
                <input
                  type="date"
                  value={paymentData.payment_received_date}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, payment_received_date: e.target.value }))}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Collected By:</label>
                <input
                  type="text"
                  value={paymentData.collected_by}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, collected_by: e.target.value }))}
                  placeholder="Enter name"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
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

      {/* Seat Cancellation Modal */}
      {cancelModal.show && (
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
            <h3>Cancel Booking</h3>
            <p><strong>Passenger:</strong> {cancelModal.booking?.passenger_details.name}</p>
            {(cancelModal.booking?.onward_seat_number || cancelModal.booking?.return_seat_number) && (
              <>
                {cancelModal.booking?.onward_seat_number && (
                  <p><strong>Onward Seat:</strong> {cancelModal.booking?.onward_seat_number} ({cancelModal.booking?.onward_bus_details?.bus_number})</p>
                )}
                {cancelModal.booking?.return_seat_number && (
                  <p><strong>Return Seat:</strong> {cancelModal.booking?.return_seat_number} ({cancelModal.booking?.return_bus_details?.bus_number})</p>
                )}
              </>
            )}
            
            <form onSubmit={handleBookingCancellation}>
              <div style={{ marginBottom: '15px' }}>
                <label>Cancellation Reason:</label>
                <select
                  value={cancelData.reason}
                  onChange={(e) => setCancelData(prev => ({ ...prev, reason: e.target.value }))}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="Passenger Request">Passenger Request</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Travel Plan Changed">Travel Plan Changed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Refund Amount:</label>
                <input
                  type="number"
                  step="0.01"
                  value={cancelData.refund_amount}
                  onChange={(e) => setCancelData(prev => ({ ...prev, refund_amount: e.target.value }))}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Notes:</label>
                <textarea
                  value={cancelData.notes}
                  onChange={(e) => setCancelData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', resize: 'vertical' }}
                  placeholder="Additional notes about the cancellation..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setCancelModal({ show: false, booking: null })}
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
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Booking
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