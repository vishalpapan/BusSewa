import React, { useState, useEffect } from 'react';
import { bookingAPI, paymentAPI } from '../services/api';

interface Booking {
  id: number;
  passenger_details: {
    id: number;
    name: string;
    age_criteria: string;
<<<<<<< HEAD
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
=======
    related_to?: number;
  };
  seat_number: string | number | null;
  pickup_point_name: string;
  calculated_price: number;
  assigned_bus?: number | null;
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
}

interface Payment {
  booking: number;
  amount: number;
}

<<<<<<< HEAD
interface Journey {
  id: number;
  journey_type: 'ONWARD' | 'RETURN';
  journey_date: string;
  is_active: boolean;
}

=======
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
interface Bus {
  id: number;
  bus_number: string;
  capacity: number;
  route_name: string;
<<<<<<< HEAD
  journey_details?: Journey;
=======
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
}

const SeatAllocation: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
<<<<<<< HEAD
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedBus, setSelectedBus] = useState<number | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<'ONWARD' | 'RETURN'>('ONWARD');
  const [seats, setSeats] = useState<(number | null)[]>(Array(42).fill(null));
=======
  const [selectedBus, setSelectedBus] = useState<number | null>(null);
  const [seats, setSeats] = useState<(number | null)[]>(Array(40).fill(null));
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
  const [selectedPassenger, setSelectedPassenger] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const [bookingsRes, paymentsRes, busesRes, journeysRes] = await Promise.all([
        bookingAPI.getAll(),
        paymentAPI.getAll(),
        fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/buses/`).then(r => r.json()),
        fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/journeys/`).then(r => r.json())
=======
      const [bookingsRes, paymentsRes, busesRes] = await Promise.all([
        bookingAPI.getAll(),
        paymentAPI.getAll(),
        fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/buses/`).then(r => r.json())
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
      ]);
      
      setBookings(bookingsRes.data);
      setPayments(paymentsRes.data);
      setBuses(busesRes);
<<<<<<< HEAD
      setJourneys(journeysRes.filter((j: Journey) => j.is_active));
=======
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
      
      // Set first bus as default if none selected
      if (!selectedBus && busesRes.length > 0) {
        setSelectedBus(busesRes[0].id);
      }
      
<<<<<<< HEAD
      // Update seats for selected bus and journey
      const targetBus = selectedBus || (busesRes.length > 0 ? busesRes[0].id : null);
      updateSeatsForBusAndJourney(bookingsRes.data, targetBus, selectedJourney);
=======
      updateSeatsForBus(bookingsRes.data, selectedBus || (busesRes.length > 0 ? busesRes[0].id : null));
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    } catch (error) {
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };
  
<<<<<<< HEAD
  const updateSeatsForBusAndJourney = (allBookings: Booking[], busId: number | null, journeyType: 'ONWARD' | 'RETURN') => {
    const seatMap = Array(42).fill(null);
    allBookings.forEach((b: Booking) => {
      const busMatch = journeyType === 'ONWARD' 
        ? b.onward_bus_details?.id === busId
        : b.return_bus_details?.id === busId;
      
      const seatNumber = journeyType === 'ONWARD' 
        ? b.onward_seat_number
        : b.return_seat_number;
      
      if (busMatch && seatNumber) {
        const seatNum = parseInt(seatNumber);
        if (!isNaN(seatNum) && seatNum >= 1 && seatNum <= 42) {
          seatMap[seatNum - 1] = b.id;
        }
=======
  const updateSeatsForBus = (allBookings: Booking[], busId: number | null) => {
    const seatMap = Array(40).fill(null);
    allBookings.forEach((b: Booking) => {
      const seatNum = parseInt(b.seat_number as string);
      if (b.seat_number && !isNaN(seatNum) && seatNum >= 1 && seatNum <= 40) {
        seatMap[seatNum - 1] = b.id;
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
      }
    });
    setSeats(seatMap);
  };

  const getPaidBookings = () => {
    return bookings.filter(b => {
      const payment = payments.find(p => p.booking === b.id);
      return payment && parseFloat(payment.amount.toString()) > 0;
    });
  };

  const getUnassignedBookings = () => {
<<<<<<< HEAD
    return getPaidBookings().filter(b => {
      const seatNumber = selectedJourney === 'ONWARD' ? b.onward_seat_number : b.return_seat_number;
      
      // For backward compatibility, show all bookings if no journey-specific data exists
      const hasJourney = selectedJourney === 'ONWARD' 
        ? (b.journey_type === 'ONWARD' || b.journey_type === 'BOTH' || !b.journey_type)
        : (b.journey_type === 'RETURN' || b.journey_type === 'BOTH' || !b.journey_type);
      
      return hasJourney && (!seatNumber || seatNumber === '' || seatNumber === '0');
    });
  };

  const getPassengerAge = (booking: Booking): number => {
    // Use actual age if available, otherwise derive from age_criteria
    if (booking.passenger_details.age) {
      return booking.passenger_details.age;
    }
    
    const ageCriteria = booking.passenger_details.age_criteria;
=======
    return getPaidBookings().filter(b => !b.seat_number || b.seat_number === '' || b.seat_number === '0');
  };

  const getPassengerAge = (ageCriteria: string): number => {
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    if (ageCriteria.includes('75 & Above')) return 75;
    if (ageCriteria.includes('65 & Above')) return 65;
    if (ageCriteria.includes('12 & Below')) return 12;
    if (ageCriteria.includes('Above 12 & Below 65')) return 40;
    if (ageCriteria.includes('Above 12 & Below 75')) return 40;
    return 30;
  };

  const getSuggestedSeat = (booking: Booking): number | null => {
<<<<<<< HEAD
    const age = getPassengerAge(booking);
    
    // Senior citizens (65+) get priority seats 1-8
=======
    const age = getPassengerAge(booking.passenger_details.age_criteria);
    
    // Senior citizens (65+) get front seats (1-8)
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    if (age >= 65) {
      for (let i = 0; i < 8; i++) {
        if (seats[i] === null) return i + 1;
      }
    }
    
<<<<<<< HEAD
    // Next priority for 50+ (seats 9-16)
=======
    // 50+ get next priority (9-16)
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    if (age >= 50) {
      for (let i = 8; i < 16; i++) {
        if (seats[i] === null) return i + 1;
      }
    }
    
    // Others get remaining seats
<<<<<<< HEAD
    for (let i = 16; i < 42; i++) {
=======
    for (let i = 16; i < 40; i++) {
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
      if (seats[i] === null) return i + 1;
    }
    
    return null;
  };

  const assignSeat = async (bookingId: number, seatNum: number) => {
    if (!selectedBus) {
      alert('Please select a bus first!');
      return;
    }
    
<<<<<<< HEAD
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
=======
    try {
      console.log('Assigning seat:', { bookingId, seatNum, selectedBus });
      const response = await bookingAPI.update(bookingId, { 
        seat_number: seatNum.toString(),
        assigned_bus: selectedBus
      });
      console.log('Seat assigned successfully:', response);
      await fetchData();
      alert(`Seat ${seatNum} assigned successfully!`);
      setSelectedPassenger(null);
    } catch (error: any) {
      console.error('Error assigning seat:', error);
      
      let errorMsg = 'Unknown error';
      if (error.response?.data) {
        const data = error.response.data;
        if (data.assigned_bus) {
          errorMsg = Array.isArray(data.assigned_bus) ? data.assigned_bus[0] : data.assigned_bus;
        } else if (data.seat_number) {
          errorMsg = Array.isArray(data.seat_number) ? data.seat_number[0] : data.seat_number;
        } else if (data.non_field_errors) {
          errorMsg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        } else {
          errorMsg = JSON.stringify(data);
        }
      } else {
        errorMsg = error.message;
      }
      
      alert('Error assigning seat: ' + errorMsg);
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    }
  };

  const handleSeatClick = async (seatIndex: number) => {
    const seatNum = seatIndex + 1;
    
<<<<<<< HEAD
    if (loading) return; // Prevent double clicks
    
=======
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    if (seats[seatIndex] !== null) {
      // Seat occupied - show passenger info
      const booking = bookings.find(b => b.id === seats[seatIndex]);
      if (booking) {
        const confirmRemove = window.confirm(
          `Seat ${seatNum} is occupied by ${booking.passenger_details.name}.\nRemove this assignment?`
        );
        if (confirmRemove) {
<<<<<<< HEAD
          setLoading(true);
          try {
            const updateData = selectedJourney === 'ONWARD' 
              ? { onward_seat_number: '' }
              : { return_seat_number: '' };
            await bookingAPI.update(booking.id, updateData);
            await fetchData();
          } finally {
            setLoading(false);
          }
=======
          await bookingAPI.update(booking.id, { seat_number: '' });
          await fetchData();
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
        }
      }
    } else if (selectedPassenger) {
      // Assign selected passenger to this seat
<<<<<<< HEAD
      await assignSeat(selectedPassenger, seatNum);
=======
      assignSeat(selectedPassenger, seatNum);
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
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
<<<<<<< HEAD
        return getPassengerAge(b) - getPassengerAge(a);
=======
        return getPassengerAge(b.passenger_details.age_criteria) - 
               getPassengerAge(a.passenger_details.age_criteria);
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
      });
      
      if (!selectedBus) {
        alert('Please select a bus first!');
        return;
      }
      
<<<<<<< HEAD
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
      
=======
      for (const booking of sorted) {
        const suggestedSeat = getSuggestedSeat(booking);
        if (suggestedSeat) {
          await bookingAPI.update(booking.id, { 
            seat_number: suggestedSeat.toString(),
            assigned_bus: selectedBus
          });
          // Update local state
          const newSeats = [...seats];
          newSeats[suggestedSeat - 1] = booking.id;
          setSeats(newSeats);
        }
      }
      
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
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
    
<<<<<<< HEAD
    const age = getPassengerAge(booking);
=======
    const age = getPassengerAge(booking.passenger_details.age_criteria);
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    if (age >= 65) return '#ffc107'; // Yellow - Senior
    if (booking.passenger_details.related_to) return '#17a2b8'; // Blue - Family
    return '#dc3545'; // Red - Occupied
  };

  const renderBusLayout = () => {
    const rows = [];
    
<<<<<<< HEAD
    // 42-seat layout: 2x2 for 10 rows (40 seats) + 1x2 for last row (2 seats)
=======
    // Front seats (2x2 layout for rows 1-10)
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    for (let row = 0; row < 10; row++) {
      const leftSeats = [row * 4, row * 4 + 1];
      const rightSeats = [row * 4 + 2, row * 4 + 3];
      
<<<<<<< HEAD
      // Highlight priority seats (1-8) for seniors
      const isPriorityRow = row < 2;
      
      rows.push(
        <div key={row} style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', gap: '40px' }}>
          {isPriorityRow && (
            <div style={{ fontSize: '12px', color: '#ffc107', fontWeight: 'bold', alignSelf: 'center', marginRight: '10px' }}>
              👴 Priority
            </div>
          )}
=======
      rows.push(
        <div key={row} style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', gap: '40px' }}>
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
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
<<<<<<< HEAD
                  border: selectedPassenger && seats[seatIndex] === null ? '3px solid #007bff' : 
                         isPriorityRow ? '2px solid #ffc107' : 'none',
=======
                  border: selectedPassenger && seats[seatIndex] === null ? '3px solid #007bff' : 'none',
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
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
<<<<<<< HEAD
                  border: selectedPassenger && seats[seatIndex] === null ? '3px solid #007bff' : 
                         isPriorityRow ? '2px solid #ffc107' : 'none',
=======
                  border: selectedPassenger && seats[seatIndex] === null ? '3px solid #007bff' : 'none',
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
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
    
<<<<<<< HEAD
    // Last row with 2 seats (41, 42)
    rows.push(
      <div key={10} style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
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
      </div>
    );
    
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
=======
    return rows;
  };

  const unassignedBookings = getUnassignedBookings();
  const assignedCount = seats.filter(s => s !== null).length;

  // Handle bus selection change
  const handleBusChange = (busId: number) => {
    setSelectedBus(busId);
    setSelectedPassenger(null);
    updateSeatsForBus(bookings, busId);
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
<<<<<<< HEAD
      <h2>🚌 Seat Allocation - 42 Seater Bus</h2>
      
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
              </button>
            ));
          })()}
          {buses.filter(bus => bus.journey_details?.journey_type === selectedJourney).length === 0 && buses.length > 0 && (
            <div style={{ padding: '10px', color: '#856404', backgroundColor: '#fff3cd', borderRadius: '4px', fontStyle: 'italic' }}>
              ⚠️ No journey-specific buses found. Showing all buses for backward compatibility.
            </div>
          )}

=======
      <h2>🚌 Seat Allocation - 40 Seater Bus</h2>
      
      {/* Bus Selection */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Select Bus:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {buses.map(bus => (
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
            </button>
          ))}
          <button
            onClick={() => {
              // Create new bus
              const busNumber = prompt('Enter bus number:');
              if (busNumber) {
                fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/buses/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ bus_number: busNumber, capacity: 40 })
                }).then(() => fetchData());
              }
            }}
            style={{
              padding: '10px 15px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + Add Bus
          </button>
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
        </div>
      </div>
      
      {/* Stats */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ padding: '15px', backgroundColor: '#28a745', color: 'white', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
<<<<<<< HEAD
          <strong>Available:</strong> {42 - assignedCount}
=======
          <strong>Available:</strong> {40 - assignedCount}
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
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
<<<<<<< HEAD
            <h4 style={{ marginTop: 0 }}>Unassigned Passengers ({selectedJourney})</h4>
=======
            <h4 style={{ marginTop: 0 }}>Unassigned Passengers (Paid)</h4>
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
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
<<<<<<< HEAD
                const age = getPassengerAge(booking);
=======
                const age = getPassengerAge(booking.passenger_details.age_criteria);
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
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
