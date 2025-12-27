import React, { useState, useEffect } from 'react';
import { passengerAPI, bookingAPI, paymentAPI } from '../services/api';

interface PassengerData {
  id: number;
  name: string;
  mobile_no: string;
  booking?: any;
  payment?: any;
}

const DeleteManagement: React.FC = () => {
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [passengersRes, bookingsRes, paymentsRes] = await Promise.all([
        passengerAPI.getAll(),
        bookingAPI.getAll(),
        paymentAPI.getAll()
      ]);

      const enrichedPassengers = passengersRes.data.map((passenger: any) => {
        const booking = bookingsRes.data.find((b: any) => b.passenger === passenger.id);
        const payment = paymentsRes.data.find((p: any) => p.booking === booking?.id);
        
        return {
          ...passenger,
          booking,
          payment
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
    let confirmMessage = `⚠️ PERMANENT DELETE\n\nDelete passenger "${passengerName}"?`;
    
    if (hasBooking) {
      confirmMessage += '\n\n🚨 WARNING: This passenger has booking records.';
    }
    if (hasSeat) {
      confirmMessage += '\n🚨 WARNING: This passenger has an assigned seat.';
    }
    confirmMessage += '\n\n❌ This action CANNOT be undone and will DELETE ALL related data:\n- Passenger record\n- Booking records\n- Payment records\n- Seat assignments';
    confirmMessage += '\n\nType "DELETE" to confirm:';
    
    const confirmation = prompt(confirmMessage);
    if (confirmation !== 'DELETE') {
      alert('Delete cancelled - must type "DELETE" exactly');
      return;
    }
    
    setDeleteLoading(passengerId);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/passengers/${passengerId}/`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Passenger deleted permanently!');
        fetchAllData();
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <h2>🗑️ Delete Management - ADMIN ONLY</h2>
      
      <div style={{
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#721c24' }}>⚠️ DANGER ZONE</h3>
        <p style={{ margin: 0, color: '#721c24' }}>
          This section allows PERMANENT deletion of passenger records. 
          Use with extreme caution as deleted data cannot be recovered.
          Consider using "Cancel Booking" from Live List instead.
        </p>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Mobile</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Has Booking</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Has Seat</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Has Payment</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Risk Level</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((passenger, index) => {
              const hasBooking = !!passenger.booking;
              const hasSeat = !!passenger.booking?.seat_number;
              const hasPayment = !!passenger.payment;
              
              let riskLevel = 'Low';
              let riskColor = '#28a745';
              
              if (hasPayment) {
                riskLevel = 'High';
                riskColor = '#dc3545';
              } else if (hasSeat) {
                riskLevel = 'Medium';
                riskColor = '#ffc107';
              } else if (hasBooking) {
                riskLevel = 'Medium';
                riskColor = '#ffc107';
              }
              
              return (
                <tr key={passenger.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <div style={{ fontWeight: 'bold' }}>{passenger.name}</div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    {passenger.mobile_no || '-'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{ color: hasBooking ? '#dc3545' : '#28a745' }}>
                      {hasBooking ? '✅ Yes' : '❌ No'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{ color: hasSeat ? '#dc3545' : '#28a745' }}>
                      {hasSeat ? `✅ ${passenger.booking.seat_number}` : '❌ No'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{ color: hasPayment ? '#dc3545' : '#28a745' }}>
                      {hasPayment ? `✅ ₹${passenger.payment.amount}` : '❌ No'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: riskColor,
                      color: riskColor === '#ffc107' ? 'black' : 'white'
                    }}>
                      {riskLevel}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <button
                      onClick={() => handleDeletePassenger(
                        passenger.id, 
                        passenger.name, 
                        hasBooking, 
                        hasSeat
                      )}
                      disabled={deleteLoading === passenger.id}
                      style={{
                        backgroundColor: deleteLoading === passenger.id ? '#ccc' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: deleteLoading === passenger.id ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      title="PERMANENT DELETE - Cannot be undone!"
                    >
                      {deleteLoading === passenger.id ? '⏳ Deleting...' : '🗑️ DELETE'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {passengers.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No passengers found.
          </div>
        )}
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#d1ecf1',
        border: '1px solid #bee5eb',
        borderRadius: '8px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>💡 Safer Alternatives</h4>
        <ul style={{ margin: 0, color: '#0c5460' }}>
          <li><strong>Cancel Booking:</strong> Use "Live List" → Cancel button (preserves data)</li>
          <li><strong>Mark Inactive:</strong> Consider adding inactive status instead of deleting</li>
          <li><strong>Archive Data:</strong> Move old records to archive instead of deletion</li>
        </ul>
      </div>
    </div>
  );
};

export default DeleteManagement;