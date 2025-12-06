import React, { useState, useEffect } from 'react';
import { bookingAPI, paymentAPI } from '../services/api';

interface Booking {
  id: number;
  passenger_details: {
    id: number;
    name: string;
    age_criteria: string;
    related_to?: number;
  };
  seat_number: string | number | null;
  pickup_point_name: string;
  calculated_price: number;
}

interface Payment {
  booking: number;
  amount: number;
}

const SeatAllocation: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [seats, setSeats] = useState<(number | null)[]>(Array(42).fill(null));
  const [selectedPassenger, setSelectedPassenger] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        bookingAPI.getAll(),
        paymentAPI.getAll()
      ]);
      
      setBookings(bookingsRes.data);
      setPayments(paymentsRes.data);
      
      // Initialize seats from existing allocations
      const seatMap = Array(42).fill(null);
      bookingsRes.data.forEach((b: Booking) => {
        const seatNum = parseInt(b.seat_number as string);
        if (b.seat_number && !isNaN(seatNum) && seatNum >= 1 && seatNum <= 42) {
          seatMap[seatNum - 1] = b.id;
        }
      });
      setSeats(seatMap);
    } catch (error) {
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const getPaidBookings = () => {
    return bookings.filter(b => {
      const payment = payments.find(p => p.booking === b.id);
      return payment && parseFloat(payment.amount.toString()) > 0;
    });
  };

  const getUnassignedBookings = () => {
    return getPaidBookings().filter(b => !b.seat_number || b.seat_number === '' || b.seat_number === '0');
  };

  const getPassengerAge = (ageCriteria: string): number => {
    if (ageCriteria.includes('75 & Above')) return 75;
    if (ageCriteria.includes('65 & Above')) return 65;
    if (ageCriteria.includes('12 & Below')) return 12;
    if (ageCriteria.includes('Above 12 & Below 65')) return 40;
    if (ageCriteria.includes('Above 12 & Below 75')) return 40;
    return 30;
  };

  const getSuggestedSeat = (booking: Booking): number | null => {
    const age = getPassengerAge(booking.passenger_details.age_criteria);
    
    // Senior citizens (65+) get front seats (1-8)
    if (age >= 65) {
      for (let i = 0; i < 8; i++) {
        if (seats[i] === null) return i + 1;
      }
    }
    
    // 50+ get next priority (9-16)
    if (age >= 50) {
      for (let i = 8; i < 16; i++) {
        if (seats[i] === null) return i + 1;
      }
    }
    
    // Others get remaining seats
    for (let i = 16; i < 42; i++) {
      if (seats[i] === null) return i + 1;
    }
    
    return null;
  };

  const assignSeat = async (bookingId: number, seatNum: number) => {
    try {
      console.log('Assigning seat:', { bookingId, seatNum });
      const response = await bookingAPI.update(bookingId, { seat_number: seatNum.toString() });
      console.log('Seat assigned successfully:', response);
      await fetchData();
      alert(`Seat ${seatNum} assigned successfully!`);
      setSelectedPassenger(null);
    } catch (error: any) {
      console.error('Error assigning seat:', error);
      alert('Error assigning seat: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    }
  };

  const handleSeatClick = async (seatIndex: number) => {
    const seatNum = seatIndex + 1;
    
    if (seats[seatIndex] !== null) {
      // Seat occupied - show passenger info
      const booking = bookings.find(b => b.id === seats[seatIndex]);
      if (booking) {
        const confirmRemove = window.confirm(
          `Seat ${seatNum} is occupied by ${booking.passenger_details.name}.\nRemove this assignment?`
        );
        if (confirmRemove) {
          await bookingAPI.update(booking.id, { seat_number: '' });
          await fetchData();
        }
      }
    } else if (selectedPassenger) {
      // Assign selected passenger to this seat
      assignSeat(selectedPassenger, seatNum);
    } else {
      alert('Please select a passenger first');
    }
  };

  const autoAssignAll = async () => {
    const unassigned = getUnassignedBookings();
    
    if (unassigned.length === 0) {
      alert('All passengers are already assigned seats!');
      return;
    }
    
    const confirmAuto = window.confirm(
      `Auto-assign ${unassigned.length} passengers?\n\nSenior citizens (65+) will get front seats automatically.`
    );
    
    if (!confirmAuto) return;
    
    setLoading(true);
    try {
      // Sort by age (oldest first)
      const sorted = [...unassigned].sort((a, b) => {
        return getPassengerAge(b.passenger_details.age_criteria) - 
               getPassengerAge(a.passenger_details.age_criteria);
      });
      
      for (const booking of sorted) {
        const suggestedSeat = getSuggestedSeat(booking);
        if (suggestedSeat) {
          await bookingAPI.update(booking.id, { seat_number: suggestedSeat.toString() });
          // Update local state
          const newSeats = [...seats];
          newSeats[suggestedSeat - 1] = booking.id;
          setSeats(newSeats);
        }
      }
      
      await fetchData();
      alert('Auto-assignment completed!');
    } catch (error) {
      alert('Error during auto-assignment');
    } finally {
      setLoading(false);
    }
  };

  const getSeatColor = (seatIndex: number): string => {
    if (seats[seatIndex] === null) return '#28a745'; // Green - Available
    
    const booking = bookings.find(b => b.id === seats[seatIndex]);
    if (!booking) return '#6c757d'; // Gray
    
    const age = getPassengerAge(booking.passenger_details.age_criteria);
    if (age >= 65) return '#ffc107'; // Yellow - Senior
    if (booking.passenger_details.related_to) return '#17a2b8'; // Blue - Family
    return '#dc3545'; // Red - Occupied
  };

  const renderBusLayout = () => {
    const rows = [];
    
    // Front seats (2x2 layout for rows 1-10)
    for (let row = 0; row < 10; row++) {
      const leftSeats = [row * 4, row * 4 + 1];
      const rightSeats = [row * 4 + 2, row * 4 + 3];
      
      rows.push(
        <div key={row} style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', gap: '40px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {leftSeats.map(seatIndex => (
              <button
                key={seatIndex}
                onClick={() => handleSeatClick(seatIndex)}
                disabled={loading}
                style={{
                  width: '45px',
                  height: '45px',
                  backgroundColor: getSeatColor(seatIndex),
                  color: 'white',
                  border: selectedPassenger && seats[seatIndex] === null ? '3px solid #007bff' : 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {seatIndex + 1}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {rightSeats.map(seatIndex => (
              <button
                key={seatIndex}
                onClick={() => handleSeatClick(seatIndex)}
                disabled={loading}
                style={{
                  width: '45px',
                  height: '45px',
                  backgroundColor: getSeatColor(seatIndex),
                  color: 'white',
                  border: selectedPassenger && seats[seatIndex] === null ? '3px solid #007bff' : 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {seatIndex + 1}
              </button>
            ))}
          </div>
        </div>
      );
    }
    
    // Last row (2 seats)
    rows.push(
      <div key="last" style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', gap: '8px' }}>
        {[40, 41].map(seatIndex => (
          <button
            key={seatIndex}
            onClick={() => handleSeatClick(seatIndex)}
            disabled={loading}
            style={{
              width: '45px',
              height: '45px',
              backgroundColor: getSeatColor(seatIndex),
              color: 'white',
              border: selectedPassenger && seats[seatIndex] === null ? '3px solid #007bff' : 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {seatIndex + 1}
          </button>
        ))}
      </div>
    );
    
    return rows;
  };

  const unassignedBookings = getUnassignedBookings();
  const assignedCount = seats.filter(s => s !== null).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <h2>🚌 Seat Allocation - 42 Seater Bus</h2>
      
      {/* Stats */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ padding: '15px', backgroundColor: '#28a745', color: 'white', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <strong>Available:</strong> {42 - assignedCount}
        </div>
        <div style={{ padding: '15px', backgroundColor: '#dc3545', color: 'white', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <strong>Occupied:</strong> {assignedCount}
        </div>
        <div style={{ padding: '15px', backgroundColor: '#17a2b8', color: 'white', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <strong>Pending:</strong> {unassignedBookings.length}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', fontSize: '14px' }}>
        <span>🟢 Available</span>
        <span>🔴 Occupied</span>
        <span>🟡 Senior (65+)</span>
        <span>🔵 Family Group</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Bus Layout */}
        <div style={{ border: '2px solid #dee2e6', borderRadius: '12px', padding: '20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ textAlign: 'center', marginBottom: '15px', fontWeight: 'bold', fontSize: '16px' }}>
            🚌 Driver
          </div>
          <div style={{ borderTop: '2px dashed #6c757d', paddingTop: '15px' }}>
            {renderBusLayout()}
          </div>
        </div>

        {/* Passenger List */}
        <div>
          <div style={{ marginBottom: '15px' }}>
            <button
              onClick={autoAssignAll}
              disabled={loading || unassignedBookings.length === 0}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              ⚡ Auto-Assign All ({unassignedBookings.length})
            </button>
          </div>

          <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px', maxHeight: '600px', overflowY: 'auto' }}>
            <h4 style={{ marginTop: 0 }}>Unassigned Passengers (Paid)</h4>
            {unassignedBookings.length === 0 ? (
              <p style={{ color: '#6c757d', textAlign: 'center', padding: '20px' }}>
                {getPaidBookings().length === 0 ? (
                  <>No paid bookings yet.<br/>Record payments first!</>
                ) : (
                  <>All passengers assigned! 🎉</>
                )}
              </p>
            ) : (
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                👆 Click a passenger, then click a seat to assign
              </p>
            )}
            {unassignedBookings.length > 0 && (
              unassignedBookings.map(booking => {
                const age = getPassengerAge(booking.passenger_details.age_criteria);
                const suggested = getSuggestedSeat(booking);
                
                return (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedPassenger(booking.id)}
                    style={{
                      padding: '12px',
                      marginBottom: '10px',
                      backgroundColor: selectedPassenger === booking.id ? '#e7f3ff' : 'white',
                      border: selectedPassenger === booking.id ? '3px solid #007bff' : '1px solid #dee2e6',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{booking.passenger_details.name}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      Age: {age}+ | Pickup: {booking.pickup_point_name}
                    </div>
                    {suggested && (
                      <div style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>
                        💡 Suggested: Seat {suggested}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#007bff' }}>
          <strong>⏳ Processing...</strong>
        </div>
      )}
    </div>
  );
};

export default SeatAllocation;
