import React, { useState, useEffect } from 'react';
import { bookingAPI, paymentAPI } from '../services/api';

interface Booking {
  id: number;
  passenger_details: {
    id: number;
    name: string;
    age_criteria: string;
    age: number;
    related_to?: number;
  };
  journey_type: string;
  onward_journey_details?: { journey_date: string; journey_type: string; };
  return_journey_details?: { journey_date: string; journey_type: string; };
  onward_seat_number: string;
  return_seat_number: string;
  onward_bus_details?: { id: number; bus_number: string; };
  return_bus_details?: { id: number; bus_number: string; };
  pickup_point_name: string;
  total_price: number;
  is_volunteer?: boolean;
  payment_status: string;
  allow_unpaid_allocation?: boolean;
}

interface Payment {
  booking: number;
  amount: number;
}

interface Journey {
  id: number;
  journey_type: 'ONWARD' | 'RETURN';
  journey_date: string;
  is_active: boolean;
}

interface Bus {
  id: number;
  bus_number: string;
  capacity: number;
  route_name: string;
  journey_details?: Journey;
}

const SeatAllocation: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedBus, setSelectedBus] = useState<number | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<'ONWARD' | 'RETURN'>('ONWARD');
  const [seats, setSeats] = useState<(number | null)[]>([]); // Dynamic size
  const [selectedPassenger, setSelectedPassenger] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeBookingAction, setActiveBookingAction] = useState<Booking | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, paymentsRes, busesRes, journeysRes] = await Promise.all([
        bookingAPI.getAll(),
        paymentAPI.getAll(),
        fetch(`${process.env.REACT_APP_API_URL || '/api'}/buses/`).then(r => r.json()),
        fetch(`${process.env.REACT_APP_API_URL || '/api'}/journeys/`).then(r => r.json())
      ]);

      setBookings(bookingsRes.data);
      setPayments(paymentsRes.data);
      setBuses(busesRes);
      setJourneys(journeysRes.filter((j: Journey) => j.is_active));

      // Set first bus as default if none selected
      if (!selectedBus && busesRes.length > 0) {
        setSelectedBus(busesRes[0].id);
      }

      // Update seats for selected bus and journey
      const targetBus = selectedBus || (busesRes.length > 0 ? busesRes[0].id : null);
      updateSeatsForBusAndJourney(bookingsRes.data, targetBus, selectedJourney);
    } catch (error) {
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const updateSeatsForBusAndJourney = (allBookings: Booking[], busId: number | null, journeyType: 'ONWARD' | 'RETURN') => {
    // Determine capacity
    const currentBus = buses.find(b => b.id === busId);
    const capacity = currentBus?.capacity || 42;

    const seatMap = Array(capacity).fill(null);
    allBookings.forEach((b: Booking) => {
      const busMatch = journeyType === 'ONWARD'
        ? b.onward_bus_details?.id === busId
        : b.return_bus_details?.id === busId;

      const seatNumber = journeyType === 'ONWARD'
        ? b.onward_seat_number
        : b.return_seat_number;

      if (busMatch && seatNumber) {
        const seatNum = parseInt(seatNumber);
        if (!isNaN(seatNum) && seatNum >= 1 && seatNum <= capacity) {
          seatMap[seatNum - 1] = b.id;
        }
      }
    });
    setSeats(seatMap);
  };

  const getPaidBookings = () => {
    return bookings.filter(b => {
      // Use the booking's payment_status field (set by backend) or allow_unpaid_allocation flag
      return b.payment_status === 'Paid' || b.allow_unpaid_allocation;
    });
  };

  const getUnassignedBookings = () => {
    return getPaidBookings().filter(b => {
      const seatNumber = selectedJourney === 'ONWARD' ? b.onward_seat_number : b.return_seat_number;

      // Check Journey Type match
      const hasJourney = selectedJourney === 'ONWARD'
        ? (b.journey_type === 'ONWARD' || b.journey_type === 'BOTH' || !b.journey_type)
        : (b.journey_type === 'RETURN' || b.journey_type === 'BOTH' || !b.journey_type);

      if (!hasJourney) return false;

      // Check Date Match (New Logic)
      if (selectedBus) {
        const currentBus = buses.find(bus => bus.id === selectedBus);
        if (currentBus?.journey_details?.journey_date) {
          const busDate = new Date(currentBus.journey_details.journey_date).toDateString();

          const bookingDateStr = selectedJourney === 'ONWARD'
            ? b.onward_journey_details?.journey_date
            : b.return_journey_details?.journey_date;

          // If booking has a specific date, it MUST match the bus date
          if (bookingDateStr) {
            const bookingDate = new Date(bookingDateStr).toDateString();
            if (bookingDate !== busDate) return false;
          }
        }
      }

      return !seatNumber || seatNumber === '' || seatNumber === '0';
    });
  };

  const getPassengerAge = (booking: Booking): number => {
    // Use actual age if available, otherwise derive from age_criteria
    if (booking.passenger_details.age) {
      return booking.passenger_details.age;
    }

    const ageCriteria = booking.passenger_details.age_criteria;
    if (ageCriteria.includes('75 & Above')) return 75;
    if (ageCriteria.includes('65 & Above')) return 65;
    if (ageCriteria.includes('12 & Below')) return 12;
    if (ageCriteria.includes('Above 12 & Below 65')) return 40;
    if (ageCriteria.includes('Above 12 & Below 75')) return 40;
    return 30;
  };

  const getSuggestedSeat = (booking: Booking): number | null => {
    const age = getPassengerAge(booking);

    // Senior citizens (65+) get priority seats 1-8
    if (age >= 65) {
      for (let i = 0; i < 8; i++) {
        if (seats[i] === null) return i + 1;
      }
    }

    // Next priority for 50+ (seats 9-16)
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
    if (!selectedBus) {
      alert('Please select a bus first!');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const updateData = selectedJourney === 'ONWARD'
        ? { onward_seat_number: seatNum.toString(), onward_bus: selectedBus }
        : { return_seat_number: seatNum.toString(), return_bus: selectedBus };

      console.log('Assigning seat:', { bookingId, seatNum, selectedBus, selectedJourney, updateData });

      const response = await bookingAPI.update(bookingId, updateData);
      console.log('Assignment response:', response);

      setSelectedPassenger(null);
      alert(`${selectedJourney} seat ${seatNum} assigned successfully!`);

      // Refresh data to get updated bookings
      await fetchData();
    } catch (error: any) {
      console.error('Error assigning seat:', error);
      alert('Error assigning seat: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleVolunteer = async (booking: Booking) => {
    try {
      await bookingAPI.update(booking.id, { is_volunteer: !booking.is_volunteer });
      setActiveBookingAction(null);
      fetchData();
    } catch (error) {
      alert('Failed to update volunteer status');
    }
  };

  const removeSeatAssignment = async (booking: Booking) => {
    if (!window.confirm(`Remove seat assignment for ${booking.passenger_details.name}?`)) return;

    setLoading(true);
    try {
      const updateData = selectedJourney === 'ONWARD'
        ? { onward_seat_number: '' }
        : { return_seat_number: '' };
      await bookingAPI.update(booking.id, updateData);
      setActiveBookingAction(null);
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = async (seatIndex: number) => {
    const seatNum = seatIndex + 1;

    if (loading) return;

    if (seats[seatIndex] !== null) {
      // Seat occupied - Show Action Modal
      const booking = bookings.find(b => b.id === seats[seatIndex]);
      if (booking) {
        setActiveBookingAction(booking);
      }
    } else if (selectedPassenger) {
      // Assign selected passenger to this seat
      await assignSeat(selectedPassenger, seatNum);
    } else {
      alert('Please select a passenger first');
    }
  };

  const getSeatColor = (seatIndex: number): string => {
    if (seats[seatIndex] === null) return '#28a745'; // Green - Available

    const booking = bookings.find(b => b.id === seats[seatIndex]);
    if (!booking) return '#6c757d'; // Gray

    if (booking.is_volunteer) return '#6f42c1'; // Purple - Volunteer

    const age = getPassengerAge(booking);
    if (age >= 65) return '#ffc107'; // Yellow - Senior
    if (booking.passenger_details.related_to) return '#17a2b8'; // Blue - Family
    return '#dc3545'; // Red - Occupied
  };

  const renderBusLayout = () => {
    const currentBus = buses.find(b => b.id === selectedBus);
    const capacity = currentBus?.capacity || 42;
    const rows = [];
    const rowsCount = Math.ceil(capacity / 4);

    for (let row = 0; row < rowsCount; row++) {
      const leftSeats = [row * 4, row * 4 + 1].filter(s => s < capacity);
      const rightSeats = [row * 4 + 2, row * 4 + 3].filter(s => s < capacity);

      // Highlight priority seats (1-8) for seniors
      const isPriorityRow = row < 2;

      rows.push(
        <div key={row} style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', gap: '40px' }}>
          {isPriorityRow && (
            <div style={{ fontSize: '12px', color: '#ffc107', fontWeight: 'bold', alignSelf: 'center', marginRight: '10px' }}>
              👴 Priority
            </div>
          )}
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
                  border: selectedPassenger && seats[seatIndex] === null ? '3px solid #007bff' :
                    isPriorityRow ? '2px solid #ffc107' : 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  position: 'relative'
                }}
              >
                {seatIndex + 1}
                {bookings.find(b => b.id === seats[seatIndex])?.is_volunteer && (
                  <span style={{ position: 'absolute', top: -5, right: -5, fontSize: '10px' }}>⭐</span>
                )}
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
                  border: selectedPassenger && seats[seatIndex] === null ? '3px solid #007bff' :
                    isPriorityRow ? '2px solid #ffc107' : 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  position: 'relative'
                }}
              >
                {seatIndex + 1}
                {bookings.find(b => b.id === seats[seatIndex])?.is_volunteer && (
                  <span style={{ position: 'absolute', top: -5, right: -5, fontSize: '10px' }}>⭐</span>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return rows;
  };

  const handleJourneyChange = (journeyType: 'ONWARD' | 'RETURN') => {
    setSelectedJourney(journeyType);
    setSelectedPassenger(null);
    updateSeatsForBusAndJourney(bookings, selectedBus, journeyType);
  };

  useEffect(() => {
    if (selectedBus) {
      updateSeatsForBusAndJourney(bookings, selectedBus, selectedJourney);
    }
  }, [bookings, selectedBus, selectedJourney]);

  const unassignedBookings = getUnassignedBookings();
  const assignedCount = seats.filter(s => s !== null).length;

  const handleBusChange = (busId: number) => {
    setSelectedBus(busId);
    setSelectedPassenger(null);
    updateSeatsForBusAndJourney(bookings, busId, selectedJourney);
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
        return getPassengerAge(b) - getPassengerAge(a);
      });

      if (!selectedBus) {
        alert('Please select a bus first!');
        return;
      }

      let currentSeats = [...seats];

      for (const booking of sorted) {
        let availableSeat = null;
        for (let i = 0; i < 42; i++) {
          if (currentSeats[i] === null) {
            availableSeat = i + 1;
            break;
          }
        }

        if (availableSeat) {
          try {
            const updateData = selectedJourney === 'ONWARD'
              ? { onward_seat_number: availableSeat.toString(), onward_bus: selectedBus }
              : { return_seat_number: availableSeat.toString(), return_bus: selectedBus };

            await bookingAPI.update(booking.id, updateData);
            currentSeats[availableSeat - 1] = booking.id;
          } catch (error) {
            console.error(`Failed to assign seat ${availableSeat} to ${booking.passenger_details.name}:`, error);
          }
        }
      }

      setSeats(currentSeats);

      await fetchData();
      alert('Auto-assignment completed!');
    } catch (error) {
      alert('Error during auto-assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <h2>🚌 Seat Allocation - {buses.find(b => b.id === selectedBus)?.capacity || 42} Seater Bus</h2>

      {/* Action Modal */}
      {activeBookingAction && (
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
            width: '300px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0 }}>Manage Seat</h3>
            <p><strong>Passenger:</strong> {activeBookingAction.passenger_details.name}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => toggleVolunteer(activeBookingAction)}
                style={{
                  padding: '10px',
                  backgroundColor: activeBookingAction.is_volunteer ? '#ffc107' : '#6f42c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {activeBookingAction.is_volunteer ? 'Remove Volunteer Status' : 'Mark as Volunteer ⭐'}
              </button>

              <button
                onClick={() => removeSeatAssignment(activeBookingAction)}
                style={{
                  padding: '10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Remove Seat Assignment
              </button>

              <button
                onClick={() => setActiveBookingAction(null)}
                style={{
                  padding: '10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journey Selection */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Select Journey:</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleJourneyChange('ONWARD')}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedJourney === 'ONWARD' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📅 Onward Journey
          </button>
          <button
            onClick={() => handleJourneyChange('RETURN')}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedJourney === 'RETURN' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Return Journey
          </button>
        </div>
      </div>

      {/* Bus Selection */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Select Bus ({selectedJourney} Journey):</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {(() => {
            const journeyBuses = buses.filter(bus => {
              if (!bus.journey_details) return false;
              return bus.journey_details.journey_type === selectedJourney;
            });

            // Show all buses if no journey-specific buses found (backward compatibility)
            const displayBuses = journeyBuses.length > 0 ? journeyBuses : buses;

            return displayBuses.map(bus => (
              <button
                key={bus.id}
                onClick={() => handleBusChange(bus.id)}
                style={{
                  padding: '10px 15px',
                  backgroundColor: selectedBus === bus.id ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {bus.bus_number || `Bus ${bus.id}`}
                {bus.route_name && <div style={{ fontSize: '12px', opacity: 0.8 }}>{bus.route_name}</div>}
                {bus.journey_details && (
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>
                    {new Date(bus.journey_details.journey_date).toLocaleDateString('en-IN')}
                  </div>
                )}
                <div style={{ fontSize: '10px', marginTop: '2px' }}>Cap: {bus.capacity}</div>
              </button>
            ));
          })()}
          {buses.filter(bus => bus.journey_details?.journey_type === selectedJourney).length === 0 && buses.length > 0 && (
            <div style={{ padding: '10px', color: '#856404', backgroundColor: '#fff3cd', borderRadius: '4px', fontStyle: 'italic' }}>
              ⚠️ No journey-specific buses found. Showing all buses for backward compatibility.
            </div>
          )}

        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ padding: '15px', backgroundColor: '#28a745', color: 'white', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <strong>Available:</strong> {(buses.find(b => b.id === selectedBus)?.capacity || 42) - assignedCount}
        </div>
        <div style={{ padding: '15px', backgroundColor: '#dc3545', color: 'white', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <strong>Occupied:</strong> {assignedCount}
        </div>
        <div style={{ padding: '15px', backgroundColor: '#17a2b8', color: 'white', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
          <strong>Pending:</strong> {unassignedBookings.length}
        </div>
        {selectedBus && (
          <div style={{ padding: '15px', backgroundColor: '#6f42c1', color: 'white', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
            <strong>Bus:</strong> {buses.find(b => b.id === selectedBus)?.bus_number || `Bus ${selectedBus}`}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', fontSize: '14px' }}>
        <span>🟢 Available</span>
        <span>🔴 Occupied</span>
        <span>🟡 Senior (65+)</span>
        <span>🔵 Family Group</span>
        <span>💜 Volunteer</span>
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
            <h4 style={{ marginTop: 0 }}>Unassigned Passengers ({selectedJourney})</h4>
            {unassignedBookings.length === 0 ? (
              <p style={{ color: '#6c757d', textAlign: 'center', padding: '20px' }}>
                {getPaidBookings().length === 0 ? (
                  <>No paid bookings yet.<br />Record payments first!</>
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
                const age = getPassengerAge(booking);
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
